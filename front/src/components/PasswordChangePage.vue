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
            <el-form-item label="Old Password" prop="oldPassword">
                <el-input show-password class="input" v-model="formData.oldPassword"></el-input>
            </el-form-item>
            <el-form-item label="New Password" prop="newPassword">
                <el-input show-password class="input" v-model="formData.newPassword"></el-input>
            </el-form-item>
            <div class="button_box">
                <el-button @click="submitForm('form')">Update</el-button>
                <el-button style="margin-left: 40px;" @click="recoveryInfo">Cancel</el-button>
            </div>
        </el-form>
    </div>
</template>

<script>
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";

export default {
    name: "PasswordChangePage",
    data() {
        return {
            formData: {
                oldPassword: '',
                newPassword: '',
            },
            rules: {
                oldPassword: [
                    {
                        required: true,
                        message: 'Old password is required',
                        trigger: 'blur'
                    }
                ],
                newPassword: [
                    {
                        required: true,
                        message: 'New password is required',
                        trigger: 'blur'
                    },
                    {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?&])[A-Za-z\d.@$!%*?&]{8,}$/g,
                        message: 'Password needs to contain at least 8 characters including uppercase and lowercase letters, numbers and symbols',
                        trigger: ['blur', 'change']
                    },
                ]
            }
        }
    },
    methods: {
        submitForm(form) {
            this.$refs[form].validate((valid) => {
                if (valid) {
                    if (this.formData.oldPassword === this.formData.newPassword) {
                        ElMessage({
                            message: 'Two password is the same!',
                            type: 'error'
                        })
                    } else {
                        ElMessageBox.confirm(
                            'Are you sure you want to change password?',
                            'Warning',
                            {
                                confirmButtonText: 'Yes',
                                cancelButtonText: 'Cancel',
                                type: 'warning'
                            }
                        ).then(() => {
                            axios.post('/api/users/password/' + JSON.parse(sessionStorage.getItem('user')).id, {
                                oldpassword: this.formData.oldPassword,
                                newpassword: this.formData.newPassword
                            }, {
                                headers: {
                                    'x-access-token': JSON.parse(sessionStorage.getItem('user')).token
                                }
                            }).then((res) => {
                                ElMessage({
                                    message: 'Password is already changed!',
                                    type: 'success'
                                })
                                console.log(res)
                                this.recoveryInfo()
                            }).catch(function (error) {
                                if (error) {
                                    ElMessage({
                                        message: 'Please check your old password!',
                                        type: 'warning'
                                    })
                                    console.log(error);
                                }
                            });
                        }).catch((err) => {
                            console.log(err)
                        })
                    }
                } else {
                    ElMessage({
                        message: 'Input is invalid',
                        type: 'error'
                    })
                }
            })
        },
        recoveryInfo() {
            this.formData.oldPassword = ''
            this.formData.newPassword = ''
        }
    }
}
</script>

<style scoped>
.button_box {
    display: flex;
    justify-content: center;
    margin-top: 40px;
}
.form-box {
    display: flex;
    justify-content: center;
}
</style>
