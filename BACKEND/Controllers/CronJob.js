const { sequelize } = require("../Config/DB");
const { QueryTypes } = require("sequelize");
const cron = require('node-cron');

const CornJob = () => {
    console.log("⏰ Cron Jobs Service Started...");

    // ==========================================================
    // المهمة 1: التوليد الدوري (مرة يومياً الساعة 12 منتصف الليل)
    // ==========================================================
    cron.schedule('0 0 * * *', async () => {
        console.log("🔄 Checking for periodic surveys...");
        try {
            const result = await sequelize.query(
                `SELECT fn_process_periodic_surveys() as count`,
                { type: QueryTypes.SELECT }
            );

            const count = result[0].count;
            if (count > 0) {
                console.log(`✅ Generated ${count} new periodic surveys.`);
            } else {
                console.log(`💤 No periodic surveys needed today.`);
            }
        } catch (err) {
            console.error("❌ Periodic Job Error:", err.message);
        }
    });

    // ==========================================================
    // المهمة 2: المراقبة والتحكم (كل 10 دقائق)
    // ==========================================================
    cron.schedule('*/1 * * * *', async () => {
        console.log("⏱️ Checking survey start/end dates...");

        try {
            // أ) النشر التلقائي (للمجدولين)
            const activationResult = await sequelize.query(
                `SELECT fn_activate_scheduled_surveys() as count`,
                { type: QueryTypes.SELECT }
            );
            const activated = activationResult[0].count;

            if (activated > 0) {
                console.log(`🚀 Automatically activated ${activated} surveys.`);
            }

            // ب) الإغلاق التلقائي (للمنتهين)
            const closingResult = await sequelize.query(
                `SELECT fn_close_expired_surveys() as count`,
                { type: QueryTypes.SELECT }
            );
            const closed = closingResult[0].count;

            if (closed > 0) {
                console.log(`🛑 Automatically closed ${closed} expired surveys.`);
            }

        } catch (err) {
            console.error("❌ Status Job Error:", err.message);
        }
    });
};

module.exports = CornJob;