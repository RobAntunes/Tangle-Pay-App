import React from "react";
import { Pressable, Text, View } from "react-native";
import Google from "../assets/images/google.svg";
import { getFontFamily } from "../lib/utils/fontFamily";

const GoogleAuthButton = ({
  content,
  handler,
}: {
  content: string;
  handler: () => Promise<void>;
}) => {
  return (
    <Pressable
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "white",
        padding: 15,
        borderRadius: 5,
        marginBottom: 15,
        alignItems: "center",
        justifyContent: "space-around",
      }}
      onPress={async () => await handler()}
    >
      <View style={{ position: "absolute", left: 15 }}>
        <Google width={25} height={25} />
      </View>
      <Text
        style={{
          color: "#696969",
          textAlign: "center",
          fontFamily: getFontFamily(),
        }}
      >
        {content}
      </Text>
    </Pressable>
  );
};

export default GoogleAuthButton;
