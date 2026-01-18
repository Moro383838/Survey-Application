const jwt = require('jsonwebtoken');

// 1. التحقق من التوكن (لكل المستخدمين المسجلين)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(`🔍 [Backend] Request path: ${req.path}`);
    console.log(`🔍 [Backend] Auth Header: ${authHeader ? 'Exists' : 'MISSING'}`);

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
            if (err) return res.status(401).json({ error: "التوكن غير صالح أو منتهي الصلاحية" });

            req.user = decodedUser;
            next();
        });
    } else {
        return res.status(401).json({ error: "أنت غير مسجل دخول (لا يوجد توكن)" });
    }
};

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'ADMIN') {
            next();
        } else {
            return res.status(403).json({ error: "غير مصرح لك (تحتاج صلاحيات مدير)" });
        }
    });
};

const verifyTokenAndSchoolUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'SCHOOL_USER') {
            next();
        } else {
            return res.status(403).json({ error: "هذه العملية خاصة بمدراء المدارس فقط" });
        }
    });
};
const verifyTokenAndAdminOrAnalyzer = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'ADMIN' || req.user.roleId == '3') {
            next();
        } else {
            return res.status(403).json({ error: "غير مصرح لك (تحتاج صلاحيات مدير أو تحليل )" });
        }
    });
};
module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndSchoolUser,
    verifyTokenAndAdminOrAnalyzer
};