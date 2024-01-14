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
        <div class="button_box">
            <el-button @click="submitForm('form')">Confirm</el-button>
            <el-button @click="closeDialog">Cancel</el-button>
        </div>
        <div class="forgot-password">
            <el-link @click="goLogin('login')">Back to login</el-link>
        </div>
    </el-form>
</template>

<script>
import axios from "axios";
import {ElMessage} from "element-plus";

export default {
    name: "ForgotForm",
    data() {
        return {
            formData: {
                email: "",
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
            }
        }
    },
    methods: {
        closeDialog() {
            this.$router.push({
                name: 'Home'
            })
        },
        submitForm(form) {
            axios.post('/api/users/sendmail', {
                email: this.formData.email
            }).then((res) => {
                ElMessage({
                    message: res.data,
                    type: 'success'
                })
            }).catch((err) => {
                console.log(err)
            })
        },
        goLogin(flag) {
            this.$emit('go-login', flag)
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
.forgot-password {
    width: 100%;
    margin-top: 10px;
    display: flex;
    justify-content: center;
}
</style>
