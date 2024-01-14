<template>
    <div class="content-body">
        <div class="home-bt" @click="goHomePage">
            <el-icon><ArrowLeftBold /></el-icon>Home
        </div>
        <el-table empty-text="No phones in your shopping cart" :data="tableData" height="100%">
            <el-table-column label="Phone Title" prop="title" align="center"></el-table-column>
            <el-table-column width="150" label="Price" align="center">
                <template v-slot="scope">
                    ${{scope.row.price}}
                </template>
            </el-table-column>
            <el-table-column width="150" label="Stock" prop="stock" align="center"></el-table-column>
            <el-table-column width="150" label="Quantity" align="center">
                <template v-slot="scope">
                    <el-input-number
                        controls-position="right"
                        size="small"
                        :min="minLimit"
                        :max="scope.row.stock"
                        @change="updateTotalPrice(scope.row.quantity, scope.row.phoneID, scope.$index)"
                        v-model="scope.row.quantity">
                    </el-input-number>
                </template>
            </el-table-column>
            <el-table-column width="200" label="Operation">
                <template v-slot="scope">
                    <el-button type="danger" @click="deleteItem(scope.row.phoneID)">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="total-box">
            <div class="total-price">
                Total: ${{totalPrice}}
            </div>
            <el-button :disabled="totalPrice==0" type="primary" @click="checkout">Checkout</el-button>
        </div>
    </div>
</template>

<script>
import {ArrowLeftBold, Plus} from "@element-plus/icons-vue";
import axios from "axios";
import UserInfoPage from "@/components/UserInfoPage.vue";
import ReviewsPage from "@/components/ReviewsPage.vue";
import PasswordChangePage from "@/components/PasswordChangePage.vue";
import ListingPage from "@/components/ListingPage.vue";
import {ElMessage, ElMessageBox} from "element-plus";

export default {
    name: "ShoppingCartPage",
    components: {ArrowLeftBold, ListingPage, PasswordChangePage, ReviewsPage, UserInfoPage, Plus},
    data() {
        return {
            tableData: [],
            totalPrice: 0,
            minLimit: 0,
        }
    },
    methods: {
        goHomePage() {
            this.$emit('go-home')
        },
        getAllItem() {
            axios.get('/api/users/getCart/' + JSON.parse(sessionStorage.getItem('user')).id).then((res) => {
                this.tableData=res.data
                console.log(res)
                for (let i = 0; i < this.tableData.length; i++) {
                    axios.get('/api/phones/id/' + this.tableData[i].phoneID).then((phoneRes) => {
                        this.tableData[i] = {
                            ...this.tableData[i],
                            ...phoneRes.data,
                        }
                    }).catch((phoneErr) => {
                        console.log(phoneErr)
                    })
                }
            }).catch((err) => {
                console.log(err)
            })
        },
        deleteItem(phoneID) {
            axios.put('/api/users/deleteCartItem/' + JSON.parse(sessionStorage.getItem('user')).id + '/' +phoneID).then((res) => {
                console.log(res)
            }).catch((err) => {
                console.log(err)
            })
            this.getAllItem()
            this.getTotalPrice()
        },
        updateTotalPrice(number, phoneID, rowIndex) {
            if (number == 0) {
                ElMessageBox.confirm(
                    "Do you want to delete this product?",
                    'Warning',
                    {
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }
                ).then(() => {
                    this.deleteItem(phoneID)
                }).catch((err) => {
                    this.tableData[rowIndex].quantity = 1
                    console.log(err)
                })
            }
            this.totalPrice = 0
            for (let i = 0; i < this.tableData.length; i++) {
                this.totalPrice += this.tableData[i].quantity*this.tableData[i].price
            }
        },
        getTotalPrice() {
            axios.get('/api/users/cartTotal/' + JSON.parse(sessionStorage.getItem('user')).id).then((res) => {
                this.totalPrice = res.data
            }).catch((err) => {
                console.log(err)
            })
        },
        updateCart() {
            let data = []
            for (let i = 0; i < this.tableData.length; i++) {
                data.push({
                    phoneID: this.tableData[i].phoneID,
                    quantity: this.tableData[i].quantity
                })
            }
            console.log(data)
            axios.post('/api/users/addToCart/' + JSON.parse(sessionStorage.getItem('user')).id, data).then((res) => {
                console.log(res)
            }).catch((err) => {
                console.log(err)
            })
        },
        checkout() {
            ElMessageBox.confirm(
                "Do you want to checkout?",
                'Warning',
                {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }
            ).then(() => {
                this.updateCart()
                this.getAllItem()
                axios.post('/api/users/checkout/' + JSON.parse(sessionStorage.getItem('user')).id).then((res) => {
                    console.log(res)
                    this.goHomePage()
                    ElMessage({
                        message: 'Checkout successfully!',
                        type: 'success'
                    })
                }).catch((err) =>  {
                    console.log(err)
                })
            }).catch((err) => {
                console.log(err)
            })
        }
    },
    mounted() {
        this.getAllItem()
        this.getTotalPrice()
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
    margin-bottom: 30px;
}
.total-box {
    display: flex;
    margin-top: 10px;
    align-items: center;
    justify-content: center;
}
.total-price {
    margin-right: 200px;
    font-weight: bold;
}
</style>
