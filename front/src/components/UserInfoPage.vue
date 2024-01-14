<template>
    <div class="form-box">
        <el-form
                :model="formData"
                :rules="rules"
                ref="form"
                size="large"
                style="width: 400px"
                label-position="left"
                label-width="150px">
            <el-form-item label="First Name" prop="firstName">
                <el-input @input.native="checkEdit" class="input" v-model="formData.firstName"></el-input>
            </el-form-item>
            <el-form-item label="Last Name" prop="lastName">
                <el-input @input.native="checkEdit" class="input" v-model="formData.lastName"></el-input>
            </el-form-item>
            <el-form-item label="Email" prop="email">
                <el-input @input.native="checkEdit" class="input" v-model="formData.email"></el-input>
            </el-form-item>
            <div class="button_box">
                <el-button :disabled="!isEdit" @click="submitForm('form')">Update</el-button>
                <el-button style="margin-left: 40px;" @click="recoveryInfo">Recovery</el-button>
            </div>
        </el-form>
    </div>
</template>

<script>
import axios from "axios";
import {ElMessage} from "element-plus";

export default {
    name: "UserInfoPage",
    data() {
        return {
            isEdit: false,
            formData: {
                firstName: JSON.parse(sessionStorage.getItem('user')).firstName,
                lastName: JSON.parse(sessionStorage.getItem('user')).lastName,
                email: JSON.parse(sessionStorage.getItem('user')).email,
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
            }
        }
    },
    methods: {
        checkEdit() {
            if (this.formData.firstName !== JSON.parse(sessionStorage.getItem('user')).firstName ||
                this.formData.lastName !== JSON.parse(sessionStorage.getItem('user')).lastName||
                this.formData.email !== JSON.parse(sessionStorage.getItem('user')).email
            ) {
                this.isEdit = true
            } else {
                this.isEdit = false
            }
        },
        submitForm(form) {
            this.$refs[form].validate((valid) => {
                if (valid) {
                    //post
                    axios.post('/api/users/change/'+JSON.parse(sessionStorage.getItem('user')).id, {
                        firstName: this.formData.firstName,
                        lastName: this.formData.lastName,
                        email: this.formData.email,
                    }, {
                        headers: {
                            'x-access-token': JSON.parse(sessionStorage.getItem('user')).token
                        }
                    }).then(() => {
                        ElMessage({
                            message: 'Update Successful!',
                            type: 'success'
                        })
                        sessionStorage.setItem('user', JSON.stringify({
                            token: JSON.parse(sessionStorage.getItem('user')).token,
                            id: JSON.parse(sessionStorage.getItem('user')).id,
                            firstName: this.formData.firstName,
                            lastName: this.formData.lastName,
                            email: this.formData.email,
                        }))
                        this.$emit('update-name')
                        this.recoveryInfo()
                    }).catch(function (error) {
                        if (error) {
                            ElMessage({
                                message: 'The email is already registered!',
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
        },
        recoveryInfo() {
            this.formData.firstName = JSON.parse(sessionStorage.getItem('user')).firstName
            this.formData.lastName = JSON.parse(sessionStorage.getItem('user')).lastName
            this.formData.email = JSON.parse(sessionStorage.getItem('user')).email
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
.form-box {
    display: flex;
    justify-content: center;
}
</style>
