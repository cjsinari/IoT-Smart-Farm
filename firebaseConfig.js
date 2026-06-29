export const FIREBASE_URL = "https://iot-smart-farm-f5fcc-default-rtdb.firebaseio.com";

//Fetch all readings from Firebase REST API
export const fetchReadings = async () => {
    try {
        const response = await fetch(`${FIREBASE_URL}/farms/busia/readings.json`);
        const data = await response.json();
        if (!data) return [];
        return Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        console.error('Firebase fetch error:', error);
        return [];
    }
};
