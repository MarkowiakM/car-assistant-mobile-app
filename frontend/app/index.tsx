

import React from "react";
import { View, Text, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Link } from "expo-router";

export default function MainScreen() {
  const navigation = useNavigation();

  return (
    <View className="bg-background h-screen text-white flex flex-col items-center justify-center gap-20">
      <View className="flex flex-col items-center gap-2">
        <Text className="text-white text-3xl">Twoja droga</Text>
        <Text className="text-[#7AC0D2] text-3xl">nasze wsparcie</Text>
      </View>
      <Image
          source={require("../assets/images/logo.jpg")} 
          style={{ width: 200, height: 200 }}
          className="rounded-3xl shadow-xl"
        />
      <Link href="/home" className="my-10 py-3 w-[70%] bg-[#B5EBF2] rounded-2xl shadow-xl text-2xl text-center tracking-wider">Zaczynamy</Link>
    </View>
  );
}
