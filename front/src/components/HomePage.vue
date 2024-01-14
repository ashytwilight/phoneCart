<template>
    <div class="header">
        <div class="title" @click="goHomePage">Old Phone Deals</div>
        <div class="welcome-box">
            <el-button class="shopping-bag-bt" @click="isUserPage='Cart'" type="primary" :icon="ShoppingBag" circle v-if="isLogin"></el-button>
            <div class="user_name">Hi,&nbsp</div>
            <div v-if="!isLogin" class="user_name underline" @click="goToLoginPage">Please Login</div>
            <div v-if="isLogin" class="user_name underline" @click="openUserPage"> {{firstName}}</div>
            <el-button @click="signOut" size="small" class="sign-out" type="danger" round v-if="isLogin">Sign out</el-button>
        </div>
    </div>
    <div class="body">
        <ListPage v-if="isUserPage=='List'"></ListPage>
        <user-page v-if="isUserPage=='User'" @go-home="goHomePage" @update-name="updateName"></user-page>
        <ShoppingCartPage v-if="isUserPage=='Cart'" @go-home="goHomePage"></ShoppingCartPage>
    </div>
</template>

<script>
import LoginForm from "@/components/LoginForm.vue";
import RegisterForm from "@/components/RegisterForm.vue";
import {ElMessage, ElMessageBox} from "element-plus";
import ListPage from "@/components/ListPage.vue";
import UserPage from "@/components/UserPage.vue";
import {ShoppingBag} from "@element-plus/icons-vue";
import ShoppingCartPage from "@/components/ShoppingCartPage.vue";

export default {
    name: "LoginPage",
    computed: {
        ShoppingBag() {
            return ShoppingBag
        },
    },
    components: {ShoppingCartPage, UserPage, ListPage, LoginForm, RegisterForm},
    data() {
        return {
            firstName: "",
            lastName: "",
            title: "Login",
            isLogin: false,
            isUserPage: 'List',
        }
    },
    methods: {
        goToLoginPage() {
            this.$router.push({
                name: 'Login'
            })
        },
        updateName() {
            this.firstName = JSON.parse(sessionStorage.getItem('user')).firstName
            this.lastName = JSON.parse(sessionStorage.getItem('user')).lastName
        },
        signOut() {
            ElMessageBox.confirm(
                'Are you sure you want to log out?',
                'Warning',
                {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }
            ).then(() => {
                this.firstName = ""
                this.lastName = ""
                this.isLogin = false
                sessionStorage.removeItem('user')
                this.isUserPage = 'List'
                ElMessage({
                    type: 'success',
                    message: 'Sign out successfully！',
                })
            }).catch((err) => {
                console.log(err)
            })
        },
        openUserPage() {
            if (this.isUserPage!='User') {
                this.isUserPage = 'User'
            }
        },
        goHomePage() {
            if (this.isUserPage!='List') {
                this.isUserPage = "List"
            }
        }
    },
    mounted() {
        if (sessionStorage.getItem('user')) {
            this.firstName = JSON.parse(sessionStorage.getItem('user')).firstName
            this.lastName = JSON.parse(sessionStorage.getItem('user')).lastName
            this.isLogin = true
        } else {
            this.isLogin = false
        }
    }
}
</script>

<style scoped>
.header {
    display: flex;
    width: 100%;
    height: 70px;
    align-items: center;
    justify-content: space-between;
    background-color: #1B1F23;
    min-width: 800px;
}
.title {
    color: white;
    font-weight: bold;
    margin: 0 50px;
    font-size: 25px;
    cursor: pointer;
}
.user_name {
    color: white;
    font-size: 15px;
}
.underline {
    cursor: pointer;
    text-decoration: underline;
}
.welcome-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0 50px;
}
.sign-out {
    margin-left: 20px;
}
.body {
    display: flex;
    justify-content: center;
    background-color: #F2F2F5;
    padding: 20px;
}
.shopping-bag-bt {
    margin-right: 10px;
}
.shopping-bag-body {

}
</style>
