<template>
    <el-form
        :model="formData"
        :rules="rules"
        ref="form"
        label-position="left"
        label-width="120px">
        <el-form-item label="First Name" prop="firstName">
            <el-input v-model="formData.firstName"></el-input>
        </el-form-item>
        <el-form-item label="Last Name" prop="lastName">
            <el-input v-model="formData.lastName"></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
            <el-input v-model="formData.email"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
            <el-input show-password v-model="formData.password"></el-input>
        </el-form-item>
        <div class="button_box">
            <el-button @click="submitForm('form')">Register</el-button>
            <el-button @click="closeDialog">Cancel</el-button>
        </div>
        <div class="login_box">
            Already have an account?
            <el-link @click="goLogin('login')" class="login_link">Sign In</el-link>
        </div>
    </el-form>
</template>

<script>
import axios from "axios";
import {ElMessage} from "element-plus";

export default {
    name: "LoginDialog",
    data() {
        return {
            formData: {
                firstName: "",
                lastName: "",
                email: "",
                password: "",
            },
            rules: {
                firstName: [
                    {
                        required: true,
                        message: 'First name is required',
                        trigger: 'blur'
                    }
                ],
                lastName: [
                    {
                        required: true,
                        message: 'Last name is required',
                        trigger: 'blur'
                    }
                ],
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
                    },
                    {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&])[A-Za-z\d.@$!%*?&]{8,}$/g,
                        message: 'Password needs to contain at least 8 characters including uppercase and lowercase letters, numbers and symbols',
                        trigger: ['blur', 'change']
                    }
                ]
            }
        }
    },
    methods: {
        goLogin(flag) {
            this.$emit('go-login', flag)
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
                    axios.post('/api/users/signUp', {
                        firstName: this.formData.firstName,
                        lastName: this.formData.lastName,
                        email: this.formData.email,
                        password: this.formData.password
                    }).then((response) => {
                        ElMessage({
                            message: 'Please check your email to complete registration!',
                            type: 'success'
                        })
                        this.goLogin('login')
                        console.log(response);
                    }).catch(function (error) {
                        if (error) {
                            ElMessage({
                                message: 'This email is already registered!',
                                type: 'warning'
                            })
                            console.log(error);
                        }
                    });
                } else {
                    ElMessage({
                        message: 'Input is invalid',
                        type: 'error'
                    })
                }
            })
        }
    }
}
</script>

<style scoped>
.button_box {
    display: flex;
    justify-content: center;
    margin-top: 50px;
}
.login_box {
    display: flex;
    align-items: center;
    margin-top: 10px;
    justify-content: center;
}
.login_link {
    margin-left: 10px;
}
</style>
