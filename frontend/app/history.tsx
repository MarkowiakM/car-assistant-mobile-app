import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRecoilValue } from "recoil";
import { historyState } from "@/state/history";
import { AnswerQuestion } from "@/types/AnswerQuestion";
import { Link } from "expo-router";

export default function ChatHistoryScreen() {
  const history = useRecoilValue(historyState);

  const renderItem: React.FC<{ item: AnswerQuestion }> = ({ item }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.role === "user" ? styles.userMessage : styles.modelMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.role === "user" ? styles.userText : styles.modelText,
          ]}
        >
          {item.parts[0].text}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historia czatu</Text>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <Link 
        href="/home"
        style={styles.returnButton}
      >
        Wróć
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
    backgroundColor: "#172026",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#B5EBF2",
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
  userMessage: {
    backgroundColor: "#B5EBF2",
    marginRight: 0,
  },
  modelMessage: {
    backgroundColor: "#7AC0D2",
    marginLeft: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "black",
  },
  modelText: {
    color: "white",
  },
  returnButton: {
    backgroundColor: "#B5EBF2",
    color: "#172026",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
  }
});
