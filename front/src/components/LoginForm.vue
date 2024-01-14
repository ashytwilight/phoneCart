<template>
    <el-form
        :model="formData"
        :rules="rules"
        ref="form"
        label-position="left"
        label-width="100px">
        <el-form-item label="Email" prop="email">
            <el-input v-model="formData.email"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
            <el-input show-password v-model="formData.password"></el-input>
        </el-form-item>
        <div class="button_box">
            <el-button @click="submitForm('form')">Login</el-button>
            <el-button @click="closeDialog">Cancel</el-button>
        </div>
        <div class="register_box">
            New to OldPhoneDeals?
            <el-link @click="goRegister('register')" class="register_link">Create Account</el-link>
        </div>
        <div class="forgot-password">
            <el-link @click="goForgotPassword('forgot')">Forgot password?</el-link>
        </div>
    </el-form>

</template>

<script>

import {ElMessage} from "element-plus";
import axios from "axios";

export default {
    name: "LoginForm",
    data() {
        return {
            formData: {
                email: "",
                password: "",
            },
            rules: {
                email: [
                    {
                        required: true,
                        message: 'E-mail address is required',
                        trigger: 'blur'
                    },
                    {
                        type: 'email',
                        message: 'Please input correct email address',
                        trigger: ['blur', 'change']
                    }
                ],
                password: [
                    {
                        required: true,
                        message: 'Password is required',
                        trigger: 'blur'
                    }
                ]
            }
        }
    },
    methods: {
        goRegister(flag) {
            this.$emit('go-register', flag)
        },
        closeDialog() {
            this.$router.push({
                name: 'Home'
            })
        },
        submitForm(form) {
            this.$refs[form].validate((valid) => {
                if (valid) {
                    //post
                    axios.post('/api/users/signIn', {
                        email: this.formData.email,
                        password: this.formData.password
                    }).then((response) => {
                        console.log(response)
                        if (response.status=='200') {
                            ElMessage({
                                message: 'login successful!',
                                type: 'success'
                            })
                            sessionStorage.setItem('user', JSON.stringify({
                                token: response.data.token,
                                id: response.data.validUser._id,
                                firstName: response.data.validUser.firstName,
                                lastName: response.data.validUser.lastName,
                                email: response.data.validUser.email
                            }))
                            this.$router.replace({
                                name: 'Home',
                            })
                        }
                    }).catch(function (error) {
                        console.log(error);
                        if (error.response.data.error == 'unauthenticated') {
                            ElMessage({
                                message: "Your email haven't verified!" ,
                                type: 'error'
                            })
                        } else {
                            ElMessage({
                                message: "Your email or password is wrong!" ,
                                type: 'error'
                            })
                        }
                    });
                } else {
                    ElMessage({
                        message: 'Input is invalid',
                        type: 'warning'
                    })
                }
            })
        },
        goForgotPassword(flag) {
            this.$emit('go-register', flag)
        }
    }
}
</script>

<style scoped>
.button_box {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}
.register_box {
    display: flex;
    align-items: center;
    margin-top: 20px;
    justify-content: center;
}
.register_link {
    margin-left: 20px;
}
.forgot-password {
    width: 100%;
    margin-top: 10px;
    display: flex;
    justify-content: center;
}
</style>
