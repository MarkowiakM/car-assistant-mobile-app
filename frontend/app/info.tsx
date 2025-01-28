

import React from "react";
import { View, Text, Image } from "react-native";
import { Link } from "expo-router";

export default function MainScreen() {

  return (
    <View className="bg-background h-screen text-white flex flex-col items-center justify-center gap-20">
      <View className="flex flex-col items-center gap-2">
        <Text className="text-white text-3xl">Informacje o aplikacji</Text>
      </View>
      <Link href="/home" className="my-10 py-3 w-[70%] bg-[#B5EBF2] rounded-2xl shadow-xl text-2xl text-center tracking-wider">Zaczynamy</Link>
    </View>
  );
}
