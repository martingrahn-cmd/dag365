const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// Evenemang-data (tom — fyll på med nästa evenemang)
const events = [];

function getEventId(event) {
    return `${event.date}_${event.time}_${event.sport}`;
}

/**
 * Scheduled function som körs var 15:e minut
 * Kollar om något evenemang börjar inom 30 minuter och skickar notiser
 */
exports.sendScheduledNotifications = functions
    .region('europe-west1')
    .pubsub.schedule('every 15 minutes')
    .timeZone('Europe/Stockholm')
    .onRun(async (context) => {
        if (events.length === 0) {
            return null;
        }

        const now = new Date();
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

        console.log(`Kollar evenemang mellan ${fifteenMinutesFromNow.toISOString()} och ${thirtyMinutesFromNow.toISOString()}`);

        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(`${event.date}T${event.time}:00+01:00`);
            return eventDate > fifteenMinutesFromNow && eventDate <= thirtyMinutesFromNow;
        });

        if (upcomingEvents.length === 0) {
            console.log('Inga evenemang inom 15-30 minuter');
            return null;
        }

        console.log(`Hittade ${upcomingEvents.length} evenemang att notifiera om`);

        const subscribersSnapshot = await db.collection('subscribers').get();

        if (subscribersSnapshot.empty) {
            console.log('Inga prenumeranter');
            return null;
        }

        const notifications = [];

        for (const event of upcomingEvents) {
            const eventId = getEventId(event);

            subscribersSnapshot.forEach(doc => {
                const subscriber = doc.data();
                const token = subscriber.token;
                const selectedEvents = subscriber.events || [];

                if (selectedEvents.includes(eventId)) {
                    notifications.push({
                        token,
                        data: {
                            title: event.title || `🇸🇪 ${event.type} om 30 min!`,
                            body: `${event.type}: ${event.event} kl ${event.time}`,
                            eventId,
                            url: 'https://dag365.se'
                        },
                        webpush: {
                            headers: {
                                Urgency: 'high'
                            },
                            fcmOptions: {
                                link: 'https://dag365.se'
                            }
                        }
                    });
                }
            });
        }

        if (notifications.length === 0) {
            console.log('Ingen har valt notis för dessa evenemang');
            return null;
        }

        console.log(`Skickar ${notifications.length} notis(er)`);

        const results = await Promise.allSettled(
            notifications.map(msg => messaging.send(msg))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`Skickade: ${successful}, Misslyckade: ${failed}`);

        // Rensa ogiltiga tokens
        const failedTokens = [];
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const error = result.reason;
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    failedTokens.push(notifications[index].token);
                }
            }
        });

        if (failedTokens.length > 0) {
            console.log(`Rensar ${failedTokens.length} ogiltiga tokens`);
            const batch = db.batch();
            for (const token of failedTokens) {
                const docs = await db.collection('subscribers').where('token', '==', token).get();
                docs.forEach(doc => batch.delete(doc.ref));
            }
            await batch.commit();
        }

        return null;
    });

/**
 * Firestore-trigger för att skicka testnotiser
 * Triggas när ett dokument skapas i testNotifications-samlingen
 */
exports.sendTestNotification = functions
    .region('europe-west1')
    .firestore.document('testNotifications/{docId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        const token = data.token;

        if (!token) {
            console.error('testNotification: Token saknas');
            return null;
        }

        try {
            await messaging.send({
                token,
                data: {
                    title: '🇸🇪 Testnotis från dag365!',
                    body: 'Push-notiser fungerar! Du kommer få påminnelser för kommande evenemang.'
                },
                webpush: {
                    headers: {
                        Urgency: 'high'
                    },
                    fcmOptions: {
                        link: 'https://dag365.se'
                    }
                }
            });
            console.log('testNotification: Notis skickad till', token.substring(0, 10) + '...');
        } catch (error) {
            console.error('testNotification: Fel vid skickning:', error);
        }

        // Rensa upp testdokumentet
        try {
            await snap.ref.delete();
        } catch (e) {
            // Ignorera om det inte går att radera
        }

        return null;
    });
