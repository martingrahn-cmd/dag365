const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// OS 2026 Sveriges tävlingsschema
const olympicsEvents = [
    // Curling Mixed Dubbel
    { date: '2026-02-04', time: '19:05', sport: 'curling', event: 'Sverige – Sydkorea', type: 'Mixed dubbel' },
    { date: '2026-02-05', time: '10:05', sport: 'curling', event: 'Sverige – Tjeckien', type: 'Mixed dubbel' },
    { date: '2026-02-05', time: '19:05', sport: 'curling', event: 'Estland – Sverige', type: 'Mixed dubbel' },
    { date: '2026-02-06', time: '10:05', sport: 'curling', event: 'Sverige – Storbritannien', type: 'Mixed dubbel' },

    // Snowboard Big Air
    { date: '2026-02-05', time: '19:30', sport: 'snowboard', event: 'Big Air kval', type: 'Snowboard herrar' },
    { date: '2026-02-06', time: '19:30', sport: 'snowboard', event: 'Big Air final', type: 'Snowboard herrar' },

    // Hockey Damer
    { date: '2026-02-05', time: '12:10', sport: 'hockey', event: 'Sverige – Tyskland', type: 'Damer gruppspel' },
    { date: '2026-02-07', time: '14:40', sport: 'hockey', event: 'Sverige – Italien', type: 'Damer gruppspel' },
    { date: '2026-02-08', time: '16:40', sport: 'hockey', event: 'Frankrike – Sverige', type: 'Damer gruppspel' },
    { date: '2026-02-10', time: '12:10', sport: 'hockey', event: 'Japan – Sverige', type: 'Damer gruppspel' },

    // Längdskidor
    { date: '2026-02-07', time: '13:00', sport: 'skiing', event: 'Skiathlon 7,5+7,5 km', type: 'Längd damer' },
    { date: '2026-02-08', time: '12:30', sport: 'skiing', event: 'Skiathlon 10+10 km', type: 'Längd herrar' },
    { date: '2026-02-10', time: '11:45', sport: 'skiing', event: 'Sprint final', type: 'Längd' },
    { date: '2026-02-12', time: '13:00', sport: 'skiing', event: '10 km klassisk', type: 'Längd damer' },
    { date: '2026-02-13', time: '12:00', sport: 'skiing', event: '10 km fri stil', type: 'Längd herrar' },
    { date: '2026-02-15', time: '12:00', sport: 'skiing', event: 'Stafett 4x10 km', type: 'Längd herrar' },
    { date: '2026-02-16', time: '12:00', sport: 'skiing', event: 'Stafett 4x5 km', type: 'Längd damer' },
    { date: '2026-02-19', time: '11:00', sport: 'skiing', event: 'Lagsprint', type: 'Längd' },
    { date: '2026-02-21', time: '12:30', sport: 'skiing', event: '50 km masstart', type: 'Längd herrar' },
    { date: '2026-02-22', time: '12:30', sport: 'skiing', event: '30 km masstart', type: 'Längd damer' },

    // Freeski Slopestyle
    { date: '2026-02-07', time: '10:30', sport: 'freestyle', event: 'Slopestyle kval', type: 'Freeski damer' },
    { date: '2026-02-07', time: '14:00', sport: 'freestyle', event: 'Slopestyle kval', type: 'Freeski herrar' },
    { date: '2026-02-09', time: '12:30', sport: 'freestyle', event: 'Slopestyle final', type: 'Freeski damer' },
    { date: '2026-02-10', time: '12:30', sport: 'freestyle', event: 'Slopestyle final', type: 'Freeski herrar' },

    // Skidskytte
    { date: '2026-02-08', time: '14:05', sport: 'biathlon', event: 'Mixedstafett', type: 'Skidskytte' },
    { date: '2026-02-10', time: '13:30', sport: 'biathlon', event: 'Distans 20 km', type: 'Skidskytte herrar' },
    { date: '2026-02-11', time: '14:15', sport: 'biathlon', event: 'Distans 15 km', type: 'Skidskytte damer' },
    { date: '2026-02-13', time: '14:00', sport: 'biathlon', event: 'Sprint 10 km', type: 'Skidskytte herrar' },
    { date: '2026-02-14', time: '14:00', sport: 'biathlon', event: 'Sprint 7,5 km', type: 'Skidskytte damer' },
    { date: '2026-02-15', time: '11:15', sport: 'biathlon', event: 'Jaktstart 12,5 km', type: 'Skidskytte herrar' },
    { date: '2026-02-15', time: '14:45', sport: 'biathlon', event: 'Jaktstart 10 km', type: 'Skidskytte damer' },
    { date: '2026-02-18', time: '14:30', sport: 'biathlon', event: 'Stafett 4x7,5 km', type: 'Skidskytte herrar' },
    { date: '2026-02-19', time: '14:30', sport: 'biathlon', event: 'Stafett 4x6 km', type: 'Skidskytte damer' },
    { date: '2026-02-20', time: '14:30', sport: 'biathlon', event: 'Masstart 15 km', type: 'Skidskytte herrar' },
    { date: '2026-02-21', time: '14:30', sport: 'biathlon', event: 'Masstart 12,5 km', type: 'Skidskytte damer' },

    // Snowboard Big Air Damer
    { date: '2026-02-08', time: '19:30', sport: 'snowboard', event: 'Big Air kval', type: 'Snowboard damer' },
    { date: '2026-02-09', time: '19:30', sport: 'snowboard', event: 'Big Air final', type: 'Snowboard damer' },

    // Puckelpist
    { date: '2026-02-10', time: '11:15', sport: 'freestyle', event: 'Puckelpist kval', type: 'Freestyle herrar' },
    { date: '2026-02-10', time: '19:30', sport: 'freestyle', event: 'Puckelpist final', type: 'Freestyle herrar (Wallberg)' },

    // Backhoppning
    { date: '2026-02-10', time: '18:45', sport: 'jumping', event: 'Mixed team', type: 'Backhoppning' },
    { date: '2026-02-11', time: '18:45', sport: 'jumping', event: 'Normalbacke', type: 'Backhoppning damer' },
    { date: '2026-02-13', time: '18:45', sport: 'jumping', event: 'Normalbacke', type: 'Backhoppning herrar' },
    { date: '2026-02-15', time: '18:45', sport: 'jumping', event: 'Stora backen', type: 'Backhoppning herrar' },
    { date: '2026-02-16', time: '19:00', sport: 'jumping', event: 'Super team', type: 'Backhoppning herrar' },

    // Nordisk kombination
    { date: '2026-02-11', time: '10:00', sport: 'jumping', event: 'Gundersen normalbacke + 10km', type: 'Nordisk komb. herrar' },
    { date: '2026-02-14', time: '10:00', sport: 'jumping', event: 'Gundersen normalbacke + 5km', type: 'Nordisk komb. damer' },
    { date: '2026-02-17', time: '10:00', sport: 'jumping', event: 'Gundersen stora backen + 10km', type: 'Nordisk komb. herrar' },

    // Snowboard Halfpipe
    { date: '2026-02-11', time: '10:30', sport: 'snowboard', event: 'Halfpipe kval', type: 'Snowboard damer' },
    { date: '2026-02-11', time: '19:30', sport: 'snowboard', event: 'Halfpipe kval', type: 'Snowboard herrar' },
    { date: '2026-02-12', time: '19:30', sport: 'snowboard', event: 'Halfpipe final', type: 'Snowboard damer' },
    { date: '2026-02-13', time: '19:30', sport: 'snowboard', event: 'Halfpipe final', type: 'Snowboard herrar' },

    // Curling Damer
    { date: '2026-02-11', time: '09:05', sport: 'curling', event: 'USA – Sverige', type: 'Damer' },
    { date: '2026-02-11', time: '19:05', sport: 'curling', event: 'Sverige – Japan', type: 'Damer' },
    { date: '2026-02-12', time: '14:05', sport: 'curling', event: 'Danmark – Sverige', type: 'Damer' },
    { date: '2026-02-13', time: '09:05', sport: 'curling', event: 'Sverige – Kanada', type: 'Damer' },
    { date: '2026-02-14', time: '14:05', sport: 'curling', event: 'Sverige – Schweiz', type: 'Damer' },
    { date: '2026-02-15', time: '14:05', sport: 'curling', event: 'Sydkorea – Sverige', type: 'Damer' },
    { date: '2026-02-16', time: '09:05', sport: 'curling', event: 'Sverige – Kina', type: 'Damer' },
    { date: '2026-02-17', time: '09:05', sport: 'curling', event: 'Storbritannien – Sverige', type: 'Damer' },
    { date: '2026-02-18', time: '09:05', sport: 'curling', event: 'Sverige – Norge', type: 'Damer' },

    // Curling Herrar
    { date: '2026-02-10', time: '19:05', sport: 'curling', event: 'Sverige – Italien', type: 'Herrar' },
    { date: '2026-02-11', time: '14:05', sport: 'curling', event: 'Storbritannien – Sverige', type: 'Herrar' },
    { date: '2026-02-12', time: '19:05', sport: 'curling', event: 'Kanada – Sverige', type: 'Herrar' },
    { date: '2026-02-13', time: '14:05', sport: 'curling', event: 'Sverige – USA', type: 'Herrar' },
    { date: '2026-02-14', time: '09:05', sport: 'curling', event: 'Norge – Sverige', type: 'Herrar' },
    { date: '2026-02-15', time: '09:05', sport: 'curling', event: 'Sverige – Kina', type: 'Herrar' },
    { date: '2026-02-16', time: '14:05', sport: 'curling', event: 'Schweiz – Sverige', type: 'Herrar' },
    { date: '2026-02-17', time: '14:05', sport: 'curling', event: 'Sverige – Danmark', type: 'Herrar' },
    { date: '2026-02-18', time: '14:05', sport: 'curling', event: 'Japan – Sverige', type: 'Herrar' },

    // Hockey Herrar
    { date: '2026-02-12', time: '12:10', sport: 'hockey', event: 'Finland – Sverige', type: 'Herrar gruppspel' },
    { date: '2026-02-14', time: '12:10', sport: 'hockey', event: 'Sverige – Slovakien', type: 'Herrar gruppspel' },
    { date: '2026-02-16', time: '12:10', sport: 'hockey', event: 'Sverige – Italien', type: 'Herrar gruppspel' },

    // Alpint
    { date: '2026-02-15', time: '10:00', sport: 'alpine', event: 'Storslalom åk 1', type: 'Alpint damer (Hector)' },
    { date: '2026-02-15', time: '13:30', sport: 'alpine', event: 'Storslalom åk 2', type: 'Alpint damer (Hector)' },
    { date: '2026-02-16', time: '10:00', sport: 'alpine', event: 'Storslalom åk 1', type: 'Alpint herrar' },
    { date: '2026-02-16', time: '13:30', sport: 'alpine', event: 'Storslalom åk 2', type: 'Alpint herrar' },
    { date: '2026-02-18', time: '10:00', sport: 'alpine', event: 'Slalom åk 1', type: 'Alpint damer (Swenn Larsson)' },
    { date: '2026-02-18', time: '13:30', sport: 'alpine', event: 'Slalom åk 2', type: 'Alpint damer' },

    // Snowboard Slopestyle
    { date: '2026-02-17', time: '10:30', sport: 'snowboard', event: 'Slopestyle kval', type: 'Snowboard damer' },
    { date: '2026-02-17', time: '14:00', sport: 'snowboard', event: 'Slopestyle kval', type: 'Snowboard herrar' },
    { date: '2026-02-18', time: '12:30', sport: 'snowboard', event: 'Slopestyle final', type: 'Snowboard herrar' },

    // Freeski Big Air
    { date: '2026-02-18', time: '19:30', sport: 'freestyle', event: 'Big Air kval', type: 'Freeski herrar' },
    { date: '2026-02-19', time: '12:30', sport: 'freestyle', event: 'Big Air final', type: 'Freeski herrar' },

    // Skicross
    { date: '2026-02-20', time: '10:00', sport: 'freestyle', event: 'Skicross kval', type: 'Freestyle herrar' },
    { date: '2026-02-20', time: '13:00', sport: 'freestyle', event: 'Skicross final', type: 'Freestyle herrar' },
    { date: '2026-02-21', time: '10:00', sport: 'freestyle', event: 'Skicross kval', type: 'Freestyle damer (Näslund)' },
    { date: '2026-02-21', time: '12:00', sport: 'freestyle', event: 'Skicross final', type: 'Freestyle damer (Näslund)' },

    // Finaler
    { date: '2026-02-19', time: '19:10', sport: 'hockey', event: 'OS-final', type: 'Hockey damer' },
    { date: '2026-02-20', time: '14:05', sport: 'curling', event: 'OS-final', type: 'Curling damer' },
    { date: '2026-02-21', time: '14:05', sport: 'curling', event: 'OS-final', type: 'Curling herrar' },
    { date: '2026-02-22', time: '14:10', sport: 'hockey', event: 'OS-final', type: 'Hockey herrar' },
];

// Skapa event-ID (samma som frontend)
function getEventId(event) {
    return `${event.date}_${event.time}_${event.sport}`;
}

// Sport-ikoner
const sportIcons = {
    hockey: '🏒',
    curling: '🥌',
    skiing: '⛷️',
    alpine: '🏔️',
    freestyle: '🎿',
    snowboard: '🏂',
    jumping: '🦅',
    biathlon: '🎯'
};

/**
 * Scheduled function som körs var 15:e minut
 * Kollar om någon tävling börjar inom 30 minuter och skickar notiser
 */
exports.sendScheduledNotifications = functions
    .region('europe-west1')
    .pubsub.schedule('every 15 minutes')
    .timeZone('Europe/Stockholm')
    .onRun(async (context) => {
        const now = new Date();
        const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

        console.log(`Kollar tävlingar mellan ${fifteenMinutesFromNow.toISOString()} och ${thirtyMinutesFromNow.toISOString()}`);

        // Hitta tävlingar som börjar inom 15-30 minuter
        const upcomingEvents = olympicsEvents.filter(event => {
            const eventDate = new Date(`${event.date}T${event.time}:00+01:00`); // CET
            return eventDate > fifteenMinutesFromNow && eventDate <= thirtyMinutesFromNow;
        });

        if (upcomingEvents.length === 0) {
            console.log('Inga tävlingar inom 15-30 minuter');
            return null;
        }

        console.log(`Hittade ${upcomingEvents.length} tävling(ar) att notifiera om`);

        // Hämta alla prenumeranter
        const subscribersSnapshot = await db.collection('subscribers').get();

        if (subscribersSnapshot.empty) {
            console.log('Inga prenumeranter');
            return null;
        }

        const notifications = [];

        for (const event of upcomingEvents) {
            const eventId = getEventId(event);
            const icon = sportIcons[event.sport] || '🏅';

            // Hitta alla som valt notis för denna tävling
            subscribersSnapshot.forEach(doc => {
                const subscriber = doc.data();
                const token = subscriber.token;
                const selectedEvents = subscriber.events || [];

                if (selectedEvents.includes(eventId)) {
                    notifications.push({
                        token,
                        notification: {
                            title: `${icon} Sverige tävlar om 30 min!`,
                            body: `${event.type}: ${event.event} kl ${event.time}`
                        },
                        data: {
                            eventId,
                            url: 'https://dag365.se'
                        },
                        webpush: {
                            fcmOptions: {
                                link: 'https://dag365.se'
                            }
                        }
                    });
                }
            });
        }

        if (notifications.length === 0) {
            console.log('Ingen har valt notis för dessa tävlingar');
            return null;
        }

        console.log(`Skickar ${notifications.length} notis(er)`);

        // Skicka alla notiser
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
 * HTTP endpoint för att testa notiser (kan tas bort i produktion)
 */
exports.testNotification = functions
    .region('europe-west1')
    .https.onRequest(async (req, res) => {
        // CORS
        res.set('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            res.status(204).send('');
            return;
        }

        const { token } = req.body;

        if (!token) {
            res.status(400).json({ error: 'Token saknas' });
            return;
        }

        try {
            await messaging.send({
                token,
                notification: {
                    title: '🇸🇪 Testnotis från dag365!',
                    body: 'Push-notiser fungerar! Du kommer få påminnelser innan svenska OS-tävlingar.'
                },
                webpush: {
                    fcmOptions: {
                        link: 'https://dag365.se'
                    }
                }
            });
            res.json({ success: true, message: 'Notis skickad!' });
        } catch (error) {
            console.error('Fel vid testnotis:', error);
            res.status(500).json({ error: error.message });
        }
    });
