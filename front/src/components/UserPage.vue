<template>
    <div class="content-body">
        <div class="home-bt" @click="goHomePage">
            <el-icon><ArrowLeftBold /></el-icon>Home
        </div>
        <el-tabs stretch v-model="tabNum" >
            <el-tab-pane label="User Info" name="userInfo">
                <UserInfoPage @update-name="updateName"></UserInfoPage>
            </el-tab-pane>
            <el-tab-pane label="Password" name="password">
                <PasswordChangePage></PasswordChangePage>
            </el-tab-pane>
            <el-tab-pane label="Listings" name="listings">
                <ListingPage></ListingPage>
            </el-tab-pane>
            <el-tab-pane label="Comments" name="comment">
                <ReviewsPage></ReviewsPage>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import {ref} from "vue";
import UserInfoPage from "@/components/UserInfoPage.vue";
import PasswordChangePage from "@/components/PasswordChangePage.vue";
import {ArrowLeftBold} from "@element-plus/icons-vue";
import ListingPage from "@/components/ListingPage.vue";
import ReviewsPage from "@/components/ReviewsPage.vue";

export default {
    name: "UserPage",
    components: {ReviewsPage, ListingPage, ArrowLeftBold, PasswordChangePage, UserInfoPage},
    data() {
        return {
            tabNum: ref('userInfo')
        }
    },
    methods: {
        updateName() {
            this.$emit('update-name')
        },
        goHomePage() {
            this.$emit('go-home')
        }
    }
}
</script>

<style scoped>
.content-body {
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    width: 90%;
    min-width: 800px;
}
.home-bt {
    cursor: pointer;
    display: flex;
    align-items: center;
}
</style>
