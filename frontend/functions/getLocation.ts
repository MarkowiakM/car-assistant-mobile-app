import * as Location from "expo-location";

export const getCurrentLocation = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            console.log("Location permission denied");
            return;
        }
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return { lat: location.coords.latitude, lon: location.coords.longitude };
    } catch (error) {
        console.error("Error getting location:", error);
    }
};