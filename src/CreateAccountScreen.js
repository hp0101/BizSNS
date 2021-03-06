import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, InputAccessoryView, Keyboard } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import firebase from 'firebase';

export default class LoginScreen extends React.Component {
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props);
        this.state = { fullName: '', email: '', password: '', confirmPassword: '', loading: false }
    }

    onButtonPress() {
        this.setState({ error: '', loading: true })
        let self = this;
        setTimeout(function () {
            let { fullName, email, password, confirmPassword } = self.state;
            if (email != undefined ) {
                email = email.trim()
            }

            if (fullName != undefined ) {
                fullName = fullName.trim()
            }

            if (fullName != "" && email != "" && password != "" && confirmPassword != "") {
                if (password != confirmPassword) {
                    self.setState({
                        fullName: '', email: '', password: '', confirmPassword: '', loading: false
                    })

                    setTimeout(function () { self.setState({ error: "Password does not match." }) }, 100);

                }
                else {
                    firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then(() => {
                            var user = firebase.auth().currentUser;
                            user.updateProfile({
                                displayName: fullName
                            }).then(() => {
                                console.log("Successfully update displayName")
                                console.log("fullName=" + fullName)
                                console.log("displayName = " + user.displayName)
                            }).catch(() => {
                                console.log("Failed to update displayName")
                                console.log("fullName=" + fullName)
                                console.log("displayName = " + user.displayName)
                            })

                            user.sendEmailVerification().catch(function (error) {
                                let errorCode = error.code;
                                let errorMessage = error.message;
                                let errorCodeMessage = errorCode + " - " + errorMessage;
                                self.setState({
                                    fullName: '', email: '', password: '', confirmPassword: '', loading: false
                                })

                                setTimeout(function () { self.setState({ error: errorCodeMessage }) }, 100);
                            });
                            firebase.firestore().collection("users").doc(email).set({
                                fullName: fullName,
                                email: email,
                                password: password,
                            })
                                .then(function (docRef) {
                                    console.log("document written with ID: ", docRef.id)
                                })
                                .catch(function (error) {
                                    let errorCode = error.code;
                                    let errorMessage = error.message;
                                    let errorCodeMessage = errorCode + " - " + errorMessage;
                                    self.setState({
                                        fullName: '', email: '', password: '', confirmPassword: '', loading: false
                                    })
                                    setTimeout(function () { self.setState({ error: errorCodeMessage }) }, 100);
                                })
                            self.props.navigation.navigate('VerifyEmail')
                        })
                        .catch((error) => {
                            let errorCode = error.code;
                            let errorMessage = error.message;
                            let errorCodeMessage = errorCode + " - " + errorMessage;
                            self.setState({
                                fullName: '', email: '', password: '', confirmPassword: '', loading: false
                            })

                            setTimeout(function () { self.setState({ error: errorCodeMessage }) }, 100);

                        });
                }
            }
            else {
                self.setState({
                    fullName: '', email: '', password: '', confirmPassword: '', loading: false
                })

                // let self = this;
                setTimeout(function () { self.setState({ error: "One of the required fields is empty." }) }, 100);

            }
        }, 100);

    }

    renderButton() {
        if (this.state.loading)
            return (
                <View style={styles.spinnerStyle}>
                    <ActivityIndicator style={{ paddingTop: hp('2%') }} size={"small"} />
                </View>
            );

        return (
            <TouchableOpacity
                style={styles.button}
                onPress={this.onButtonPress.bind(this)}
            >
                <Text style={{ color: 'white', fontSize: wp('5%'), textAlign: 'center' }}> Sign Up </Text>
            </TouchableOpacity>
        )
    }

    renderView(inputAccessoryViewID) {
        if (Platform.OS == 'ios') {
            return (
                <View style={styles.container}>
                    <View style={styles.smallerContainer}>
                        <Text style={{ color: '#457EED', fontSize: wp('7%'), marginBottom: hp('5%') }}>Create Account</Text>
                        <Text style={{ color: '#999999', marginBottom: hp('1%') }}>Full Name</Text>
                        <TextInput style={styles.input}
                            onChangeText={(fullName) => this.setState({ fullName })}
                            value={this.state.fullName}
                            inputAccessoryViewID={inputAccessoryViewID}
                            autoCorrect={false}
                        />
                        <Text style={{ color: '#999999', marginBottom: hp('1%') }}>Email</Text>
                        <TextInput style={styles.input}
                            onChangeText={(email) => this.setState({ email })}
                            value={this.state.email}
                            autoCapitalize='none'
                            inputAccessoryViewID={inputAccessoryViewID}
                        />
                        <Text style={{ color: '#999999', marginBottom: hp('1%') }}>Password</Text>
                        <TextInput style={styles.input}
                            onChangeText={(password) => this.setState({ password })}
                            value={this.state.password}
                            secureTextEntry={true}
                            autoCapitalize='none'
                            inputAccessoryViewID={inputAccessoryViewID}
                        />
                        <Text style={{ color: '#999999', marginBottom: hp('1%') }}>Confirm Password</Text>
                        <TextInput style={styles.input}
                            onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                            value={this.state.confirmPassword}
                            secureTextEntry={true}
                            autoCapitalize='none'
                            inputAccessoryViewID={inputAccessoryViewID}
                        />
                        <InputAccessoryView nativeID={inputAccessoryViewID}>
                            <View style={{ backgroundColor: 'white', alignItems: 'flex-end', backgroundColor: '#eff0f1' }}>
                                <TouchableOpacity style={{ padding: hp('1%'), }}
                                    onPress={Keyboard.dismiss}>
                                    <Text style={{ color: '#457EED', fontSize: wp('5%') }}>Hide</Text>
                                </TouchableOpacity>
                            </View>
                        </InputAccessoryView>
                        {this.renderButton()}
                        <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                            <Text style={{ color: '#999999' }}>
                                Already have an account?
                        </Text>
                            <Text> </Text>
                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate('Login')}>
                                <Text style={{ color: '#457EED' }}>
                                    Login
                            </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ marginTop: hp('2%'), textAlign: 'center', color: 'red' }}>
                            {this.state.error}
                        </Text>
                    </View>
                </View>
            );
        }
        else if (Platform.OS = 'android') {
            return (
                <View style={styles.container}>
                    <View style={styles.smallerContainer}>
                        <Text style={{ color: '#457EED', fontSize: wp('7%'), marginBottom: hp('5%') }}>Create Account</Text>
                        <Text style={{ color: '#999999', marginBottom: hp('1%') }}>Full Name</Text>
                        <TextInput style={styles.input}
                            onChangeText={(fullName) => this.setState({ fullName })}
                            value={this.state.fullName}
                            autoCorrect={false}
                        />
                        <Text style={{ color: '#999999', marginBottom: hp('1%') }}>Email</Text>
                        <TextInput style={styles.input}
                            onChangeText={(email) => this.setState({ email })}
                            value={this.state.email}
                            autoCapitalize='none'
                        />
                        <Text style={{ color: '#999999', marginBottom: hp('1%') }}>Password</Text>
                        <TextInput style={styles.input}
                            onChangeText={(password) => this.setState({ password })}
                            value={this.state.password}
                            secureTextEntry={true}
                            autoCapitalize='none'
                        />
                        <Text style={{ color: '#999999', marginBottom: hp('1%') }}>Confirm Password</Text>
                        <TextInput style={styles.input}
                            onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                            value={this.state.confirmPassword}
                            secureTextEntry={true}
                            autoCapitalize='none'
                        />
                        {this.renderButton()}
                        <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                            <Text style={{ color: '#999999' }}>
                                Already have an account?
                        </Text>
                            <Text> </Text>
                            <TouchableOpacity
                                onPress={() => this.props.navigation.navigate('Login')}>
                                <Text style={{ color: '#457EED' }}>
                                    Login
                            </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ marginTop: hp('2%'), textAlign: 'center', color: 'red' }}>
                            {this.state.error}
                        </Text>
                    </View>
                </View>
            );
        }
    }

    render() {
        const inputAccessoryViewID = 'inputAccessoryView1';
        return (
            this.renderView(inputAccessoryViewID)
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#457EED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    smallerContainer: {
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        // alignItems: 'center',
        borderRadius: wp('5%'),
        paddingVertical: hp('5%'),
        paddingHorizontal: wp('10%'),
        width: wp('90%')
    },
    input: {
        borderWidth: wp('0.1%'),
        borderRadius: wp('1%'),
        ...Platform.select({
            ios: {
                height: hp('5%')
            }
        }),
        borderColor: '#999999',
        marginBottom: hp('3%')
    },
    button: {
        borderRadius: wp('10%'),
        backgroundColor: '#457EED',
        padding: wp('3%'),
        marginTop: hp('2%')
    },
})