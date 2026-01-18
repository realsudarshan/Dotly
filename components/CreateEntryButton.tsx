import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function CreateEntryButton() {
  const handlePress = () => {
    router.push("/new-entry");
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={handlePress}>
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#904BFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  fabText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
});
