

import React from "react";
import { View, Text, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Link } from "expo-router";

export default function MainScreen() {
  const navigation = useNavigation();

  return (
    <View className="bg-background h-screen text-white flex flex-col items-center justify-center gap-20">
      <View className="flex flex-col items-center gap-2">
        <Text className="text-foreground text-3xl">Historia</Text>
      </View>
      <Link href="/home" className="my-10 py-3 w-[70%] bg-[#B5EBF2] rounded-2xl shadow-xl text-2xl text-center tracking-wider">Zaczynamy</Link>
    </View>
  );
}
