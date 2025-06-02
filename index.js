/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.applyDailyPenalties = onSchedule(
    {
      schedule: "59 23 * * *", // Runs daily at 11:59 PM
      timeZone: "Asia/Kolkata",
    },
    async (context) => {
      const userRef = db.collection("SystemUsers").doc("Player");
      const userSnap = await userRef.get();
      if (!userSnap.exists) return;

      const data = userSnap.data();
      const baseAttributes = {
        str: 10,
        agi: 10,
        vit: 10,
        int: 10,
      };
      const attr = {...data.attributeValues};

      const importantTasks = [
        "push day",
        "pull day",
        "leg day",
        "upper body",
        "lower body",
        "stretching and posture correction",
        "play chess",
        "3hr study",
        "walk 2hrs stright a day",
        "run 5k daily",
        "speak english",
        "complete protien",
        "don't eat junk food",
        "daily_python_cv_quest",
      ];

      const completed = data.completedTasks || {};
      const today = new Date().toDateString();

      for (const task of importantTasks) {
        if (completed[task] !== today) {
          if (task.includes("run") || task.includes("agi")) {
            attr.agi -= 2;
          } else if (
            task.includes("chess") ||
          task.includes("study") ||
          task.includes("english") ||
          task.includes("ai") ||
          task.includes("cv")
          ) {
            attr.int -= 2;
          } else if (
            task.includes("walk") ||
          task.includes("food") ||
          task.includes("protien")
          ) {
            attr.vit -= 2;
          } else {
            attr.str -= 2;
          }
        }
      }

      let totalGain = 0;
      for (const key in attr) {
        if (Object.prototype.hasOwnProperty.call(attr, key)) {
          totalGain += attr[key] - baseAttributes[key];
        }
      }

      const dailyExp = totalGain * 13;

      await userRef.set(
          {
            attributeValues: attr,
            dailyExp,
            lastChecked: admin.firestore.Timestamp.now(),
          },
          {merge: true},
      );

      console.log("Penalties applied successfully.");
    },
);
