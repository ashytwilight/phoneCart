<template>
  <div>
      <el-table :data="tableData" height="500" empty-text="No comments">
          <el-table-column width="600" label="Phone Title" prop="title" align="center"></el-table-column>
          <el-table-column width="150" label="Rating" prop="reviews.rating" align="center"></el-table-column>
          <el-table-column width="600" label="Comment" align="center">
              <template v-slot="scope">
                  <div v-if="scope.row.reviews.isTooLong && scope.row.reviews.showMore==false">
                      {{scope.row.reviews.comment.slice(0,200)}}
                      <span class="more-word" @click="scope.row.reviews.showMore=true">more</span>
                  </div>
                  <div v-if="scope.row.reviews.isTooLong && scope.row.reviews.showMore==true">
                      {{scope.row.reviews.comment}}
                      <span class="more-word" @click="scope.row.reviews.showMore=false">less</span>
                  </div>
                  <div v-if="!scope.row.reviews.isTooLong">
                      {{scope.row.reviews.comment}}
                  </div>
              </template>
          </el-table-column>
          <el-table-column width="150" label="Status" align="center">
              <template v-slot="scope">
                  <div>
                      {{scope.row.reviews.hidden==undefined?'Show':'Hidden'}}
                  </div>
              </template>
          </el-table-column>
          <el-table-column fixed="right" label="Operation" width="200" align="center">
              <template v-slot="scope">
                  <el-button type="warning" @click="hiddenReview(scope.row._id, scope.row.reviews.review_id)" v-if="scope.row.reviews.hidden==undefined">Hide</el-button>
                  <el-button type="success" @click="showReview(scope.row._id, scope.row.reviews.review_id)" v-if="scope.row.reviews.hidden!=undefined">Show</el-button>
              </template>
          </el-table-column>
      </el-table>
  </div>
</template>

<script>
import axios from "axios";

export default {
    name: "ReviewsPage",
    data() {
      return {
          tableData: []
      }
    },
    methods: {
        getReviews() {
            axios.get('/api/phones/review/user/' + JSON.parse(sessionStorage.getItem('user')).id).then((res) => {
                this.tableData = res.data
                for (let i = 0; i < this.tableData.length; i++) {
                    this.tableData[i].reviews = {
                        ...this.tableData[i].reviews,
                        isTooLong: this.tableData[i].reviews.comment.length>200?true:false,
                        showMore: false
                    }
                }
            }).catch((err) => {
                console.log(err)
            })
        },
        hiddenReview(phoneId, reviewId) {
            axios.put('/api/phones/review/hide/' + phoneId + '/' + reviewId).then((res) => {
                this.getReviews()
            }).catch((err) => {
                console.log(err)
            })
        },
        showReview(phoneId, reviewId) {
            axios.put('/api/phones/review/show/' + phoneId + '/' + reviewId).then((res) => {
                this.getReviews()
            }).catch((err) => {
                console.log(err)
            })
        },
    },
    mounted() {
        this.getReviews()
    }
}
</script>

<style scoped>
.more-word {
    cursor: pointer;
    text-decoration: underline;
    font-weight: bold;
}
</style>
