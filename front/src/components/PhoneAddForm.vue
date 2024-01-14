<template>
  <div>
      <el-form
              :model="formData"
              :rules="rules"
              ref="form"
              label-position="left"
              label-width="100px">
          <el-form-item label-width="150" label="Title" prop="title">
              <el-input type="textarea" placeholder="Please input your title" v-model="formData.title"></el-input>
          </el-form-item>
          <el-form-item label-width="150" prop="imgUrl" label="Phone Photo">
              <el-upload
                      action
                      :auto-upload="false"
                      list-type="picture-card"
                      :limit="imgLimit"
                      :accept="acceptType.join(',')"
                      :before-remove="beforeRemove"
                      :on-change="getImgUrl">
                  <el-icon><Plus /></el-icon>
              </el-upload>
          </el-form-item>
          <el-form-item prop="brand" label-width="150" label="Brand">
              <el-select placeholder="Select your brand" allow-create filterable v-model="formData.brand">
                  <el-option v-for="brand in brands" :label="brand" :value="brand">
                  </el-option>
              </el-select>
          </el-form-item>
          <el-form-item label-width="150" label="Stock">
              <el-input-number :min="minLimit" v-model="formData.stock"></el-input-number>
          </el-form-item>
          <el-form-item label-width="150" label="Price">
              $<el-input-number :min="minLimit" :controls="false" v-model="formData.price"></el-input-number>
          </el-form-item>
          <el-form-item label-width="150" label="Show the phone">
              <el-switch style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" v-model="formData.isShow"></el-switch>
          </el-form-item>
          <div class="bt-box">
              <el-button type="success" @click="addPhone('form')">Add</el-button>
              <el-button style="margin-left: 80px;" @click="closeDialog">Cancel</el-button>
          </div>
      </el-form>
  </div>
</template>

<script>
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";
import {Plus} from "@element-plus/icons-vue";

export default {
    name: "PhoneAddForm",
    components: {Plus},
    data() {
        return {
            imgLimit: 2,
            acceptType: ['image/jpg', 'image/jpeg', 'image/png'],
            minLimit: 0,
            formData: {
                title: "",
                brand: "",
                stock: 0,
                price: 0,
                isShow: true,
                imgUrl: '',
                img: []
            },
            rules: {
                imgUrl: [
                    {
                        required: true,
                        message: 'Photo is required',
                        trigger: 'change'
                    },
                ],
                title: [
                    {
                        required: true,
                        message: 'Title is required',
                        trigger: 'blur'
                    },
                ],
                brand: [
                    {
                        required: true,
                        message: 'Brand is required',
                        trigger: 'change',
                    }
                ],
            },
            brands: []
        }
    },
    methods: {
        beforeRemove(uploadFile, uploadFiles) {
            if (uploadFiles.length == 1) {
                this.formData.imgUrl = ''
            }
        },
        getImgUrl(uploadFile, imgList) {
            if (this.acceptType.includes(uploadFile.raw.type)) {
                if (imgList.length>1) {
                    imgList.splice(0,1)
                }
                this.formData.imgUrl = uploadFile.name
            } else {
                if (imgList.length==1) {
                    imgList.splice(0,1)
                } else {
                    imgList.splice(1,2)
                }
                ElMessage({
                    message: 'File type has to be .jpg .jpeg .png',
                    type: 'error'
                })
            }
        },
        getAllBrand() {
            axios.get('/api/phones/brands').then((res) => {
                this.brands = res.data
            }).catch((err) => {
                console.log(err)
            })
        },
        addPhone(form) {
            this.$refs[form].validate((valid) => {
                let formData = new FormData()
                formData.append('photo', this.file.raw)
                if (valid) {
                    axios({
                        method: "post",
                        url: '/api/phones/upload',
                        data: formData,
                        headers: { "Content-Type": `multipart/form-data; boundary=${formData._boundary}`},
                    }).then((response) => {
                        this.formData.imgUrl = response.data
                        let data = {
                            title: this.formData.title,
                            brand: this.formData.brand,
                            image: this.formData.imgUrl,
                            stock: this.formData.stock,
                            seller: JSON.parse(sessionStorage.getItem('user')).id,
                            price: this.formData.price,
                        }
                        if (this.formData.isShow == false) {
                            data={
                                ...data,
                                disabled: ''
                            }
                        }
                        axios.post('/api/phones/', data).then((res) => {
                            ElMessage({
                                message: 'Add successfully!',
                                type: 'success'
                            })
                            this.closeDialog()
                            console.log(res)
                        }).catch((err) => {
                            console.log(err)
                        })
                    }).catch(function (err) {
                        console.log(err);
                    });
                } else {
                    ElMessage({
                        message: 'Please complete the form!',
                        type: 'warning'
                    })
                }
            })
        },
        closeDialog() {
            this.$emit('close-dialog')
        }
    },
    mounted() {
        if (sessionStorage.getItem('listing')) {
            this.formData = JSON.parse(sessionStorage.getItem('listing'))
        }
        this.getAllBrand()
    }
}
</script>

<style scoped>
.bt-box {
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
