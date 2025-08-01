import React from "react";
import { Text, View } from "react-native";

export default function Index() {
  // This page should never be shown - layout handles all navigation
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
}
