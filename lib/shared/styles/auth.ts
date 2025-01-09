import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  logo: {
    alignItems: "center",
    marginBottom: 40,
  },
  form: {
    width: width > 500 ? 500 : width * 0.9,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
  },
  formWrapper: {
    width: "100%",
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fafafa",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 15,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  loaderContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  mnemonicContainer: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
  },
  mnemonicText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  modalButton: {
    width: "100%",
    marginTop: 10,
  },
  wordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    padding: 10,
  },
  wordContainer: {
    backgroundColor: "#e8e8e8",
    padding: 8,
    borderRadius: 6,
    minWidth: "22%",
  },
  wordText: {
    fontSize: 14,
    textAlign: "center",
  },
  wordNumber: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

export default styles;
