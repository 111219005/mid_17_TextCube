import { StyleSheet, View, StatusBar } from "react-native";;

export default function Page() {


    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    main: {
        flex: 1,
        justifyContent: "flex-start",
    },
});
