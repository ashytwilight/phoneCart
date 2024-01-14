<template>
    <div class="big-box">
        <div class="title" @click="goHomePage">Old Phone Deals</div>
        <div class="form-body">
            <div class="home-bt" @click="goHomePage">
                <el-icon><ArrowLeftBold /></el-icon>Home
            </div>
            <LoginForm
                    v-if="isLoginPage=='login'"
                    @go-register="switchDialog">
            </LoginForm>
            <RegisterForm
                    v-if="isLoginPage=='register'"
                    @go-login="switchDialog">
            </RegisterForm>
            <ForgotForm
                v-if="isLoginPage=='forgot'"
                @go-login="switchDialog">
            </ForgotForm>
        </div>
    </div>
</template>

<script>
import LoginForm from "@/components/LoginForm.vue";
import RegisterForm from "@/components/RegisterForm.vue";
import {ArrowLeftBold} from "@element-plus/icons-vue";
import ForgotForm from "@/components/ForgotForm.vue";

export default {
    name: "LoginPage",
    components: {ForgotForm, ArrowLeftBold, RegisterForm, LoginForm},
    data() {
        return {
            isLoginPage: 'login',
        }
    },
    methods: {
        switchDialog(flag) {
            this.isLoginPage = flag
        },
        goHomePage() {
            this.$router.push({
                name: 'Home'
            })
        },
    },
    mounted() {
        console.log(JSON.parse(sessionStorage.getItem('config')))
    }
}
</script>

<style scoped>
.big-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px
}
.title {
    cursor: pointer;
    color: #1B1F23;
    font-weight: bold;
    font-size: 45px;
    margin-bottom: 50px;
}
.form-body {
    position: relative;
    display: flex;
    justify-content: center;
    width: 600px;
    border-radius: 10px;
    padding: 50px 20px;
    background-color: white;
}
.home-bt {
    position: absolute;
    left: 30px;
    top: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
}
</style>
