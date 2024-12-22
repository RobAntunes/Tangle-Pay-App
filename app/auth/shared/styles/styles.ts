
import { StyleSheet } from "react-native";

// Shared styles for both components
const styles = StyleSheet.create({
    container: {
      backgroundColor: "#f4f4f4",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    logo: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    scrollView: {
      width: "100%",
      padding: 40,
    },
    formWrapper: {
      width: "100%",
      justifyContent: "center",
    },
    form: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    title: {
      fontSize: 32,
      marginBottom: 5,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 18,
      marginBottom: 20,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ddd",
      padding: 15,
      marginBottom: 15,
      borderRadius: 5,
    },
    button: {
      backgroundColor: "#007AFF",
      padding: 15,
      borderRadius: 5,
      marginBottom: 15,
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
    },
    linkText: {
      color: "#007AFF",
      textAlign: "center",
    },
    loaderContainer: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 999,
    },
    errorText: {
      fontSize: 16,
      color: "red",
      textAlign: "center",
      marginVertical: 40,
    },
  });

export default styles;
