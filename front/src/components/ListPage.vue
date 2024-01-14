<template>
    <div class="content-body">
        <div class="filter-box">
            <div class="search-box">
                <el-input
                    style="width: 200px"
                    @focus="isSearch=true"
                    clearable class="search-input"
                    placeholder="Please Input"
                    v-model="keyword">
                    <template #append>
                        <el-button :icon="Search" @click="searchPhone(keyword)" />
                    </template>
                </el-input>
                <div class="search-box" v-if="isSearch">
                    <el-select style="width: 100px" v-model="searchBrand" class="search-item" size="small">
                        <el-option
                            v-for="brand in brands"
                            :key="brand"
                            :label="brand"
                            :value="brand">
                        </el-option>
                    </el-select>
                    <div class="search-item search-box">
                        <div class="search-item-num">$0-$</div>
                        <el-input-number
                            controls-position="right"
                            style="width: 120px"
                            :min="+minPrice"
                            :controls="false"
                            placeholder="No Limit"
                            v-model.number="priceLimit"
                            size="small"></el-input-number>
                    </div>
                </div>
            </div>
            <el-radio-group @click="isSearch=false" v-model="displayType" @change="switchDisplayType">
                <el-radio-button label="Sold out soon"></el-radio-button>
                <el-radio-button label="Best sellers"></el-radio-button>
            </el-radio-group>
        </div>
        <div class="show-box">
            <div class="phone-unit" @click="clickUnit(phone)" v-for="phone in tableData">
                <el-image :src=getImage(phone.brand) class="phone-image">
                    <template #placeholder>
                        <div class="image-slot">Loading<span class="dot">...</span></div>
                    </template>
                </el-image>
                <el-tooltip placement="right">
                    <div class="phone-title">
                        {{phone.title}}
                    </div>
                    <template #content>
                        <div style="width: 200px;">
                            {{phone.title}}
                        </div>
                    </template>
                </el-tooltip>
                <div v-if="displayType=='Sold out soon'||displayType==''" class="phone-word">
                    $ {{phone.price}}
                </div>
                <div class="rate-box" v-if="displayType=='Best sellers'">
                    <el-rate style="" size="small" disabled v-model="phone.avg"></el-rate>
                    <div>{{Number(phone.avg).toFixed(2)}}</div>
                </div>
            </div>
        </div>
    </div>
    <el-dialog
        width="800"
        v-model="detailInfoVisible"
        title='Phone Information'
        destroy-on-close
        align-center
    >
        <detail-info-page
            :search-brand="searchBrand"
            :price-limit="priceLimit"
            :search-type="displayType"
            :search-keyword="keyword"
            :phone=detailInfo>
        </detail-info-page>
    </el-dialog>
<!--    <el-table @rowClick="clickRow" class="phone-table" height="500" stripe :data="tableData">-->
<!--        <el-table-column prop="image" width="150" align="center">-->
<!--            <el-image :src="url" class="phone-image">-->
<!--                <template #placeholder>-->
<!--                    <div class="image-slot">Loading<span class="dot">...</span></div>-->
<!--                </template>-->
<!--            </el-image>-->
<!--        </el-table-column>-->
<!--        <el-table-column prop="title" label="Title" align="center"></el-table-column>-->
<!--        <el-table-column v-if="displayType=='Sold out soon'" prop="brand" label="Brand" width="150" align="center"></el-table-column>-->
<!--        <el-table-column v-if="displayType=='Best sellers'" label="Rating" width="150" align="center">-->
<!--            <template v-slot="scope">-->
<!--                <el-rate disabled v-model="scope.row.avg"></el-rate>-->
<!--            </template>-->
<!--        </el-table-column>-->
<!--        <el-table-column label="Price" width="150" align="center">-->
<!--            <template v-slot="scope">-->
<!--                $ {{scope.row.price}}-->
<!--            </template>-->
<!--        </el-table-column>-->
<!--        <el-table-column prop="stock" label="Stock" width="100" align="center"></el-table-column>-->
<!--    </el-table>-->
</template>

<script>
import {Search} from '@element-plus/icons-vue'
import axios from "axios";
import {ElMessage} from "element-plus";
import DetailInfoPage from "@/components/DetailInfoPage.vue";
export default {
    name: "ListPage",
    components: {DetailInfoPage},
    data() {
        return {
            tableData: [],
            soldOutPhones: [],
            bestSellers: [],
            displayType: "Sold out soon",
            keyword: "",
            detailInfoVisible: false,
            detailInfo: {},
            isSearch: false,
            searchBrand: 'All Brands',
            priceLimit: null,
            minPrice: 0,
            brands: ["All Brands"]
        }
    },
    methods: {
        getImage(brand) {
            return "src/assets/"+ brand +".jpeg"
        },
        switchDisplayType() {
            if (this.displayType == 'Sold out soon') {
                this.tableData = this.soldOutPhones
            } else {
                this.tableData = this.bestSellers
            }
        },
        getBrands() {
          axios.get('api/phones/brands').then((res) => {
              this.brands = this.brands.concat(res.data)
          }).catch((err) => {
              console.log(err)
          })
        },
        searchPhone(keyword) {
            let maxPrice = this.priceLimit==null?'ALL':this.priceLimit
            let searchBrand = this.searchBrand=='All Brands'?'ALL':this.searchBrand
            if (keyword.trim() == "") {
                axios.get('api/phones/search/' +  maxPrice + '/' + searchBrand).then((response) => {
                    console.log(response)
                    if (response.data.length==0) {
                        ElMessage({
                            type: 'warning',
                            message: 'No phone found!',
                        })
                    }
                    this.tableData = response.data
                    this.displayType=''
                }).catch(function (error) {
                    console.log(error)
                });
            } else {
                axios.get('api/phones/search/' + keyword + '/' + maxPrice + '/' + searchBrand).then((response) => {
                    console.log(response)
                    if (response.data.length==0) {
                        ElMessage({
                            type: 'warning',
                            message: 'No phone found!',
                        })
                    }
                    this.tableData = response.data
                    this.displayType=''
                }).catch(function (error) {
                    console.log(error)
                });
            }
        },
        clickUnit(phone) {
            this.detailInfoVisible = true
            this.detailInfo = phone
        }
    },
    computed: {
        Search() {
            return Search
        }
    },
    mounted() {
        this.getBrands()
        axios.get('api/phones/soldOutSoon').then((response) => {
            this.soldOutPhones = response.data
            this.tableData = this.soldOutPhones
        }).catch(function (error) {
            console.log(error)
        });
        axios.get('api/phones/bestSeller').then((response) => {
            console.log(response.data)
            this.bestSellers = response.data
        }).catch(function (error) {
            console.log(error)
        });
        if (sessionStorage.getItem('config')) {
            this.displayType = JSON.parse(sessionStorage.getItem('config')).showType
            this.keyword = JSON.parse(sessionStorage.getItem('config')).searchKeywords
            this.searchBrand = JSON.parse(sessionStorage.getItem('config')).searchBrand
            this.priceLimit = JSON.parse(sessionStorage.getItem('config')).priceLimit
            this.detailInfo = JSON.parse(sessionStorage.getItem('config')).phoneInfo
            this.detailInfoVisible = true
            if (this.displayType === "") {
                this.isSearch = true
            }
            sessionStorage.removeItem('config')
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
.search-input {
    width: 300px;
}
.search-box {
    display: flex;
    align-items: center;
}
.search-item {
    margin-left: 10px;
}
.search-item-num {
    font-size: 10px;
}
.filter-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.show-box {
    width: 100%;
    display: flex;
    margin-top: 20px;
    flex-direction: row;
    flex-wrap: wrap;
}
.phone-unit {
    display: flex;
    align-items: center;
    flex-direction: column;
    height: 240px;
    width: 150px;
    border-radius: 10px;
    background-color: #efefef;
    margin-bottom: 10px;
    cursor: pointer;
    margin-right: 20px;
}
.phone-word {
    margin-top: 10px;
    font-weight: bold;
    font-size: 18px;
}
.rate-box {
    display: flex;
    font-size: 15px;
    align-items: center;
    margin-top: 10px;
}
.phone-title {
    width: 80%;
    height: 30px;
    font-size: 5px;
    margin-top: 10px;
    overflow: hidden;
}
.phone-image {
    margin-top: 30px;
    width: 120px;
}
</style>
