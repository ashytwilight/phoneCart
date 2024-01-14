<template>
    <div class="body-content">
        <div class="bt-box">
            <el-button type="success" :icon="Plus" @click="showAddDialog=true">Add Phone</el-button>
        </div>
        <el-table :data="tableData" border empty-text="No Phones">
            <el-table-column width="200" align="center" label="Phone Image">
                <template v-slot="scope">
                    <el-image class="phone-img" :src="scope.row.image"></el-image>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="title" label="Title"></el-table-column>
            <el-table-column align="center" prop="price" width="100" label="Price"></el-table-column>
            <el-table-column align="center" prop="stock" width="100" label="Stock"></el-table-column>
            <el-table-column align="center" prop="brand" width="100" label="Brand"></el-table-column>
            <el-table-column align="center" width="200" label="Operation">
                <template v-slot="scope">
                    <el-button v-if="scope.row.disabled==undefined" @click="hideListing(scope.row._id)" type="warning">Hide</el-button>
                    <el-button v-if="scope.row.disabled!=undefined" @click="showListing(scope.row._id)" type="success">Show</el-button>
                    <el-button type="danger" @click="deleteListing(scope.row._id)">Delete</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <el-dialog destroy-on-close width="600" title="Add Your Phone" v-model="showAddDialog">
        <phone-add-form @close-dialog="closeDialog"></phone-add-form>
    </el-dialog>
</template>

<script>
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";
import PhoneAddForm from "@/components/PhoneAddForm.vue";
import {Plus} from "@element-plus/icons-vue";

export default {
    name: "ListingPage",
    computed: {
        Plus() {
            return Plus
        }
    },
    components: {PhoneAddForm},
    data() {
        return {
            tableData: [],
            showAddDialog: false,
        }
    },
    methods: {
        closeDialog() {
            this.showAddDialog = false
            this.getAllListing()
        },
        getAllListing() {
            axios.get('/api/phones/seller/' + JSON.parse(sessionStorage.getItem('user')).id).then((res) => {
                this.tableData = res.data
                console.log(this.tableData)
            }).catch((err) => {
                console.log(err)
            })
        },
        hideListing(id) {
            axios.put('/api/phones/disable/' + id).then((res) => {
                // console.log(res)
                this.getAllListing()
            }).catch((err) => {
                console.log(err)
            })
        },
        showListing(id) {
            axios.put('/api/phones/enable/' + id).then((res) => {
                // console.log(res)
                this.getAllListing()
            }).catch((err) => {
                console.log(err)
            })
        },
        deleteListing(id) {
            ElMessageBox.confirm(
                'Are you sure to delete this listing?',
                'Warning',
                {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }
            ).then(() => {
                axios.delete('/api/phones/' + id).then((res) => {
                    ElMessage({
                        message: 'Delete successfully!',
                        type: 'success'
                    })
                    // console.log(res)
                    this.getAllListing()
                }).catch((err) => {
                    console.log(err)
                })
            }).catch((err) => {
                console.log(err)
            })
        }
    },
    mounted() {
        this.getAllListing()
    }

}
</script>

<style scoped>
.body-content {
    display: flex;
    flex-direction: column;
}
.bt-box {
    display: flex;
    justify-content: right;
    margin-bottom: 10px;
}
.phone-img {
    width: 120px;
    height: 120px;
}
</style>
