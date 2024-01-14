<template>
    <div class="detail-body">
        <div class="phone-title">{{phone.title}}</div>
        <!--      {{phone._id}}-->
        <!--      {{phone.seller}}-->
        <div class="phone-box">
            <el-image class="phone-image" :src=getImage(phone.brand)></el-image>
            <div class="detail-box">
                <div class="phone-info-word">Brand: {{phone.brand}}</div>
                <div class="phone-info-word">Stock: {{phone.stock}}</div>
                <div class="phone-info-word">Seller: {{ sellerName }}</div>
                <div class="phone-info-word">Price: ${{ phone.price }}</div>
                <el-button @click="chooseQuantity" type="success" :icon="CirclePlus">Add to Cart</el-button>
            </div>
        </div>
        <el-divider>Reviews</el-divider>

        <el-scrollbar max-height="200">
            <div class="no-comments" v-if="defaultReview.length==0">No Comments</div>
            <div :class="review.hidden!=undefined?'review-box-hidden':'review-box'" v-for="review in defaultReview">
                <div class="review-title">
                    <div>{{ review.firstName + ' ' + review.lastName }}</div>
                    <div class="rating-box">
                        <el-rate style="margin-right: 10px;" show-score size="small" disabled v-model="review.rating"></el-rate>
                        <el-button type="warning" v-if="review.show && review.hidden==undefined" @click="hiddenReview(review.review_id)" size="small">Hide</el-button>
                        <el-button type="success" v-if="review.show && review.hidden!=undefined" @click="showReview(review.review_id)" size="small">Show</el-button>
                    </div>
                </div>
                <div v-if="review.isMore==false">
                    {{review.showComment}}
                    <span v-if="review.comment.length>200" class="read-more" @click="review.isMore=true">more</span>
                </div>
                <div v-if="review.isMore==true">
                    {{review.comment}}
                    <span class="read-more" @click="review.isMore=false">less</span>
                </div>
            </div>

            <div v-if="isShow" :class="review.hidden!=undefined?'review-box-hidden':'review-box'" v-for="review in moreReview">
                <div class="review-title">
                    <div>{{ review.firstName + ' ' + review.lastName }}</div>
                    <div class="rating-box">
                        <el-rate style="margin-right: 10px;" show-score size="small" disabled v-model="review.rating"></el-rate>
                        <el-button type="warning" v-if="review.show && review.hidden==undefined" @click="hiddenReview(review.review_id)" size="small">Hide</el-button>
                        <el-button type="success" v-if="review.show && review.hidden!=undefined" @click="showReview(review.review_id)" size="small">Show</el-button>
                    </div>
                </div>
                <div>{{review.comment}}</div>
            </div>
            <div v-if="isMore && !isShow" class="read-more" @click="isShow=true">show more</div>
            <div v-if="isShow" class="read-more" @click="isShow=false">show less</div>
        </el-scrollbar>
        <el-divider></el-divider>
        <div class="input-box">
            <el-rate :disabled="!isLogin" class="rate" v-model="myRate"></el-rate>
            <el-input :disabled="!isLogin" v-model="myComment"></el-input>
            <el-button :disabled="!isLogin" class="add-comment-bt" @click="addComment">Submit</el-button>
        </div>
    </div>
    <el-dialog
        v-model="quantityDialog"
        width="400"
        destroy-on-close
        :before-close="beforeClose"
        title="Choose quantity you want to buy">
        <div class="quantity-box">
            <div>
                Quantity:
                <el-input-number
                    style="margin-left: 10px;"
                    :min=minLimit
                    :max="maxLimit"
                    v-model="showItemQuantity">
                </el-input-number>
            </div>
            <div style="margin-top: 15px;">
                <el-button @click="addToCart">Confirm</el-button>
                <el-button @click="closeQuantity">Cancel</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script>
import axios from "axios";
import {CirclePlus, Reading} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {h} from "vue";

export default {
    name: "DetailInfoPage",
    computed: {
        CirclePlus() {
            return CirclePlus
        }
    },
    components: {Reading},
    props: [
        'phone',
        'searchType',
        'searchKeyword',
        'searchBrand',
        'priceLimit'
    ],
    data() {
        return {
            sellerName: '',
            activeName: ['1'],
            allReview: [],
            defaultReview: [],
            moreReview: [],
            isMore: false,
            isShow: false,
            myRate: 0,
            myComment: '',
            isLogin: sessionStorage.getItem('user')?true:false,
            quantityDialog: false,
            minLimit: 1,
            maxLimit: +this.phone.stock,
            itemQuantity: 1,
            showItemQuantity: 1,
        }
    },
    methods: {
        beforeClose(done) {
            this.showItemQuantity = this.itemQuantity
            done()
        },
        closeQuantity() {
            this.showItemQuantity = this.itemQuantity
            this.quantityDialog=false
        },
        getImage(brand) {
            return "src/assets/"+ brand +".jpeg"
        },
        getReview(id) {
            this.defaultReview = []
            this.allReview = []
            this.moreReview = []
            let userId = sessionStorage.getItem('user')?JSON.parse(sessionStorage.getItem('user')).id:'guest'
            axios.get('/api/phones/review/'+ id +'/' + userId + '/' + this.phone.seller).then((response) => {
                for (let i = 0; i < response.data.length; i++) {
                    if (!(!response.data[i].show && response.data[i].hidden!=undefined)) {
                        this.allReview.push(response.data[i])
                    }
                }
                for (let i = 0; i < this.allReview.length; i++) {
                    this.allReview[i] = {
                        ...this.allReview[i],
                        showComment: this.allReview[i].comment.length>200?this.allReview[i].comment.slice(0,200) + '..':this.allReview[i].comment,
                        // name: this.allReview[i].firstName+ ' ' + this.allReview[i].lastName,
                        isMore: false}
                    this.allReview[i].rating = Number(this.allReview[i].rating)
                }
                if (this.allReview.length<=3) {
                    this.defaultReview = this.allReview
                    this.isMore = false
                } else {
                    for (let i = 0; i < 3; i++) {
                        this.defaultReview.push(this.allReview[i])
                    }
                    for (let i = 3; i < this.allReview.length; i++) {
                        this.moreReview.push(this.allReview[i])
                    }
                    this.isMore = true
                }
            }).catch(function (error) {
                console.log(error)
            });
        },
        getSellerName(id) {
            axios.get('/api/users/id/'+ id).then((response) => {
                this.sellerName = response.data.firstName + ' ' + response.data.lastName
            }).catch(function (error) {
                console.log(error)
            });
        },
        hiddenReview(reviewId) {
            axios.put('/api/phones/review/hide/' + this.phone._id + '/' + reviewId).then((res) => {
                console.log(res)
                this.getReview(this.phone._id)
            }).catch((err) => {
                console.log(err)
            })
        },
        showReview(reviewId) {
            axios.put('/api/phones/review/show/' + this.phone._id + '/' + reviewId).then((res) => {
                console.log(res)
                this.getReview(this.phone._id)
            }).catch((err) => {
                console.log(err)
            })
        },
        addComment() {
            if (this.myComment == '') {
                ElMessage({
                    type: 'warning',
                    message: "Comments can't be empty",
                })
            } else {
                axios.post('/api/phones/comment/' + this.phone._id, {
                    reviewer: JSON.parse(sessionStorage.getItem('user')).id,
                    rating: this.myRate,
                    comment: this.myComment,
                }).then(() => {
                    ElMessage({
                        message: 'Comment successfully!',
                        type: 'success'
                    })
                    this.getReview(this.phone._id)
                    this.myRate = 0
                    this.myComment = ''
                }).catch(function (error) {
                    console.log(error);
                });
            }
        },
        chooseQuantity() {
            if (sessionStorage.getItem('user')) {
                this.quantityDialog=true
            } else {
                ElMessageBox.confirm(
                    "You haven't login, Do you want to login?",
                    'Warning',
                    {
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }
                ).then(() => {
                    this.$router.push({
                        name: 'Login'
                    })
                    sessionStorage.setItem('config', JSON.stringify({
                        showType: this.searchType,
                        searchKeywords: this.searchKeyword,
                        searchBrand: this.searchBrand,
                        priceLimit: this.priceLimit,
                        phoneInfo: this.phone
                    }))
                }).catch((err) => {
                    console.log(err)
                })
            }
        },
        addToCart() {
            this.itemQuantity = this.showItemQuantity
            axios.post('/api/users/addToCart/' + JSON.parse(sessionStorage.getItem('user')).id, [
                {
                    phoneID: this.phone._id,
                    quantity: this.itemQuantity
                }
            ]).then((res) => {
                ElMessage({
                    message: 'Phone added successfully!',
                    type: 'success'
                })
                console.log(res)
                this.quantityDialog = false
            }).catch((err) => {
                console.log(err)
            })
        },
        getQuantity() {
            if (sessionStorage.getItem('user')) {
                axios.get('/api/users/quantityInCart/' + JSON.parse(sessionStorage.getItem('user')).id + '/' + this.phone._id)
                    .then((res) => {
                        this.showItemQuantity = res.data.quantity
                        this.itemQuantity = res.data.quantity
                    }).catch((err) => {
                    console.log(err)
                })
            }
        }
    },
    mounted() {
        this.getSellerName(this.phone.seller)
        this.getReview(this.phone._id)
        this.getQuantity()
    }
}
</script>

<style scoped>
.detail-body{
    display: flex;
    flex-direction: column;
}
.phone-title {
    font-size: 16px;
    color: #1B1F23;
    display: flex;
    justify-content: center;
}
.phone-box {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    justify-content: space-around;
}
.phone-image {
    width: 180px;
}
.detail-box {
    display: flex;
    flex-direction: column;
    margin-left: 50px;
    width: 200px;
}
.phone-info-word {
    font-size: 16px;
    margin-bottom: 12px;
}
.review-box {
    margin-top: 10px;
    padding: 10px;
    border-radius: 10px;
}
.review-box-hidden {
    margin-top: 10px;
    padding: 10px;
    border-radius: 10px;
    background-color: lightgray;
}
.review-title {
    display: flex;
    flex-direction: row;
    font-size: 15px;
    font-weight: bold;
    align-items: center;
    justify-content: space-between;
}

.rating-box {
    display: flex;
    align-items: center;
}
.read-more {
    color: #1B1F23;
    text-decoration: underline;
    cursor: pointer;
    margin-top: 10px;
}
.input-box {
    display: flex;
}
.add-comment-bt{
    margin-left: 10px;
}
.rate {
    margin-right: 10px;
}
.no-comments {
    display: flex;
    justify-content: center;
}
.quantity-box {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: center;
}
</style>
