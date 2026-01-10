const axios = require('axios');

// ⚙️ الإعدادات
const BASE_URL = 'http://localhost:3000/api';
const LOG_STEPS = true;

// متغيرات لتخزين البيانات أثناء الرحلة
let ROLES = {}; // لتخزين { ADMIN: 1, SCHOOL_USER: 2 }
let DIRECTORATES = [];
let SCHOOL_ID = null;
let ADMIN_TOKEN = null;
let TEACHER_TOKEN = null;

// ألوان
const clr = { green: '\x1b[32m', red: '\x1b[31m', blue: '\x1b[34m', yellow: '\x1b[33m', reset: '\x1b[0m' };
const log = (msg) => console.log(`${clr.blue}➤${clr.reset} ${msg}`);
const success = (msg) => console.log(`${clr.green}✅ ${msg}${clr.reset}`);
const fail = (msg, err) => {
    console.error(`${clr.red}❌ فشل: ${msg}${clr.reset}`);
    if (err.response) console.error(`   الرد: ${JSON.stringify(err.response.data)}`);
    else console.error(`   الخطأ: ${err.message}`);
    process.exit(1);
};

(async () => {
    console.log(`${clr.yellow}🚀 بدء اختبار البنية التحتية الجديد (V2 Schema)...${clr.reset}\n`);

    try {
        // ============================================================
        // 1. جلب القوائم (Lookups) - أهم خطوة في النظام الجديد
        // ============================================================
        log("جلب القوائم المساعدة (Roles & Directorates)...");
        
        // جلب الأدوار لمعرفة الـ IDs
        const rolesRes = await axios.get(`${BASE_URL}/Aid/roles`);
        rolesRes.data.forEach(r => ROLES[r.name] = r.id);
        
        if (!ROLES['ADMIN'] || !ROLES['SCHOOL_USER']) fail("لم يتم العثور على الأدوار في قاعدة البيانات! هل نفذت كود الـ Seeding؟");
        success(`تم جلب الأدوار: Admin=${ROLES['ADMIN']}, SchoolUser=${ROLES['SCHOOL_USER']}`);

        // جلب المديرياتid
        const dirRes = await axios.get(`${BASE_URL}/Aid/directorates`);
        if (dirRes.data.length === 0) fail("جدول المديريات فارغ!");
        DIRECTORATES = dirRes.data;
        const targetDirId = DIRECTORATES[0].id; // سنستخدم أول مديرية
        success(`تم اختيار مديرية: ${DIRECTORATES[0].name} (ID: ${targetDirId})`);


        // ============================================================
        // 2. إدارة المدارس (Schools V2)
        // ============================================================
        log("إنشاء مدرسة جديدة مع الربط بالمديرية...");
        
        const schoolPayload = {
            name: `مدرسة المستقبل الحديثة ${Date.now()}`,
            code: `SCH-${Date.now()}`, // كود فريد
            region: "وسط المدينة",
            directorateId: targetDirId, // الربط الجديد
            complexId: null // اختياري
        };

        const schoolRes = await axios.post(`${BASE_URL}/schools`, schoolPayload);
        SCHOOL_ID = schoolRes.data.schoolId;
        success(`تم إنشاء المدرسة بنجاح (ID: ${SCHOOL_ID})`);

        // التحقق من أن المدرسة تظهر في القائمة العامة
        const allSchools = await axios.get(`${BASE_URL}/schools`);
        const createdSchool = allSchools.data.find(s => s.id === SCHOOL_ID);
        if (!createdSchool) fail("المدرسة التي أنشأناها لا تظهر في قائمة المدارس!");
        // التأكد من أن اسم المديرية رجع معنا
        if (!createdSchool.directorate_name) fail("اسم المديرية لم يظهر في عرض المدارس (Join Error)!");
        success(`المدرسة تظهر في القائمة وتتبع لـ: ${createdSchool.directorate_name}`);


        // ============================================================
        // 3. إدارة المستخدمين (Users V2) - Admin
        // ============================================================
        log("إنشاء حساب مدير نظام (Admin)...");
        
        const adminUser = `Admin_${Date.now()}`;
        await axios.post(`${BASE_URL}/users/create`, {
            username: adminUser, // الاسم الجديد
            password: "123",
            roleId: ROLES['ADMIN'] // الرقم الجديد
        });
        success("تم إنشاء حساب الأدمن.");

        // تجربة تسجيل دخول الأدمن
        const adminLogin = await axios.post(`${BASE_URL}/users/login`, { username: adminUser, password: "123" });
        ADMIN_TOKEN = adminLogin.data.token;
        success("تم تسجيل دخول الأدمن بنجاح.");


        // ============================================================
        // 4. إدارة المستخدمين (Users V2) - School Manager
        // ============================================================
        log("إنشاء حساب مدير مدرسة وربطه...");

        const schoolUser = `Manager_${Date.now()}`;
        await axios.post(`${BASE_URL}/users/create`, {
            username: schoolUser,
            password: "123",
            roleId: ROLES['SCHOOL_USER'], // الرقم الجديد
            schoolIds: [SCHOOL_ID]
        }, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } }); // نفترض أن الإنشاء يحتاج توكن
        success("تم إنشاء حساب مدير المدرسة.");

        // تجربة تسجيل دخول مدير المدرسة
        const userLogin = await axios.post(`${BASE_URL}/users/login`, { username: schoolUser, password: "123" });
        TEACHER_TOKEN = userLogin.data.token;
        
        // التحقق من البيانات العائدة عند اللوجن
        const loggedInUser = userLogin.data.user;
        if (loggedInUser.role !== 'SCHOOL_USER') fail("اسم الدور لم يرجع بشكل صحيح عند تسجيل الدخول");
        if (loggedInUser.schools.length === 0) fail("مصفوفة المدارس فارغة!");
        if (loggedInUser.schools[0].id !== SCHOOL_ID) fail("المدرسة المربوطة غير صحيحة");
        
        success(`تم تسجيل الدخول والتحقق: المستخدم '${loggedInUser.username}' يتبع لـ '${loggedInUser.schools[0].name}'`);


        // ============================================================
        // 5. التحقق من البروفايل (Profile)
        // ============================================================
        log("جلب الملف الشخصي (Profile)...");
        
        const profileRes = await axios.get(`${BASE_URL}/users/profile`, { 
            headers: { Authorization: `Bearer ${TEACHER_TOKEN}` } 
        });
        
        if (profileRes.data.username !== schoolUser) fail("بيانات البروفايل غير مطابقة");
        success("تم جلب البروفايل بنجاح.");


        console.log(`\n${clr.green}🎉🎉🎉 مبروك! البنية التحتية (V2) تعمل بكفاءة تامة 🎉🎉🎉${clr.reset}`);

    } catch (err) {
        fail("حدث خطأ غير متوقع", err);
    }
})();