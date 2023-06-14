import React, {useEffect, useState} from "react";
import {Alert, Button, StyleSheet, TextInput} from "react-native";
import {useTheme, useToast, VStack} from "native-base";
import {Cell, Section, TableView} from "react-native-tableview-simple";
import ILemmyServer from "../../../lemmy/types/ILemmyServer";
import {Stack, useRouter, useSearchParams} from "expo-router";
import {initialize, lemmyAuthToken} from "../../../lemmy/LemmyInstance";
import {getServers, setServers} from "../../../helpers/SettingsHelper";

const EditAccountScreen = () => {
    const [form, setForm] = useState<ILemmyServer>({
        server: "",
        username: "",
        password: "",
        auth: ""
    });
    const [loading, setLoading] = useState(false);

    const {serverIndex} = useSearchParams();

    const router = useRouter();
    const toast = useToast();
    const theme = useTheme();

    useEffect(() => {
        if(serverIndex) {
            load().then();
        }
    }, []);

    const load = async () => {
        const servers = await getServers();
        setForm(servers[Number(serverIndex)]);
    };

    const onFormChange = (name: string, value: string) => {
        setForm({
            ...form,
            [name]: value
        });
    };

    const onSavePress = async () => {
        if(!form.server || !form.username || !form.password) {
            toast.show({
                description: "All fields are required.",
                duration: 3000
            });
            return;
        }

        try {
            setLoading(true);

            await initialize(form);
        } catch {
            Alert.alert("Error authenticating with server.");
            setLoading(false);
            return;
        }

        const servers = await getServers() ?? [];
        const serverIndex = servers.findIndex((x) => (x.server.toLowerCase() === form.server.toLowerCase() && x.username.toLowerCase() === form.username.toLowerCase()));

        if(serverIndex > -1) {
            servers[serverIndex] = {
                ...form,
                auth: lemmyAuthToken
            };
        } else {
            servers.push({
                ...form,
                auth: lemmyAuthToken
            });
        }

        await setServers(servers);

        router.back();
    };

    const onDeletePress = async () => {
        const servers = await getServers();
        const serverIndex = servers.findIndex((x) => (x.server.toLowerCase() === form.server.toLowerCase() && x.username.toLowerCase() === form.username.toLowerCase()));

        delete servers[serverIndex];

        await setServers(servers);

        router.back();
    };

    return (
        <VStack flex={1} backgroundColor={"screen.800"}>
            <Stack.Screen
                options={{
                    headerRight: () => {
                        return(
                            <Button title={"Save"} onPress={onSavePress} disabled={loading} />
                        );
                    }
                }}
            />

            <TableView style={styles.table}>
                <Section
                    header={"SERVER ADDRESS"}
                    roundedCorners={true}
                    hideSurroundingSeparators={true}
                    footer={"URL for the server you wish to connect"}
                >
                    <Cell
                        cellContentView={
                            <TextInput
                                style={{fontSize: 16, flex: 1, color: theme.colors.lightText}}
                                placeholderTextColor={theme.colors.screen["400"]}
                                placeholder="Server Address"
                                value={form.server}
                                onChangeText={(text) => onFormChange("server", text)}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                            />
                        }
                        backgroundColor={theme.colors.screen["700"]}
                        titleTextColor={theme.colors.lightText}
                        rightDetailColor={theme.colors.screen["400"]}
                    />
                </Section>

                <Section
                    header={"SERVER CREDENTIALS"}
                    roundedCorners={true}
                    hideSurroundingSeparators={true}
                    footer={"Credentials for the server you are connecting."}
                >
                    <Cell
                        cellContentView={
                            <TextInput
                                style={{fontSize: 16, flex: 1, color: theme.colors.lightText}}
                                placeholderTextColor={theme.colors.screen["400"]}
                                placeholder={"Username"}
                                value={form.username}
                                onChangeText={(text) => onFormChange("username", text)}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                            />
                        }
                        backgroundColor={theme.colors.screen["700"]}
                        titleTextColor={theme.colors.lightText}
                        rightDetailColor={theme.colors.screen["400"]}
                    />
                    <Cell
                        cellContentView={
                            <TextInput
                                style={{fontSize: 16, flex: 1, color: theme.colors.lightText}}
                                placeholderTextColor={theme.colors.screen["400"]}
                                placeholder={"Password"}
                                value={form.password}
                                onChangeText={(text) => onFormChange("password", text)}
                                autoCorrect={false}
                                autoCapitalize={"none"}
                                secureTextEntry={true}
                            />
                        }
                        backgroundColor={theme.colors.screen["700"]}
                        titleTextColor={theme.colors.lightText}
                        rightDetailColor={theme.colors.screen["400"]}
                    />
                </Section>

                {
                    serverIndex && (
                        <Section
                            header={"DELETE"}
                            roundedCorners={true}
                            hideSurroundingSeparators={true}
                        >
                            <Cell cellContentView={
                                <Button title={"Delete Server"} color={"red"} onPress={onDeletePress} />
                            } />
                        </Section>
                    )
                }
            </TableView>
        </VStack>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    table: {
        marginHorizontal: 15
    }
});

export default EditAccountScreen;