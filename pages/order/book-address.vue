<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" title="配送地址" :fixed="true" :status-bar="true" @clickLeft="back"></uni-nav-bar>
        <form @submit="formSubmit">
            <view class="uni-form-item uni-column">
                地址 <input type="text" :value="detail" class="uni-input" name="detail" placeholder="请填写配送地址" />
            </view>
            <view class="uni-form-item uni-column">
                联系人 <input type="text" :value="contact" class="uni-input" name="contact" placeholder="请填写联系人" />
            </view>
            <view class="uni-form-item uni-column">
                手机号 <input type="text" :value="phone" class="uni-input" name="phone" placeholder="请填写联系电话" />
                <view class="title" style="color: #FF3333;">提示：请核实配送信息，因信息错误导致无法配送责任自负</view>
            </view>
            <view class="uni-btn-v">
                <button type="primary" form-type="submit">保存</button>
            </view>
        </form>
    </view>
</template>

<script>
    import {
        mapState
    } from 'vuex'

    export default {
        data() {
            return {
                detail: '',
                contact: '',
                phone: ''
            }
        },
        computed: mapState(['employee']),
        methods: {
            back() {
                uni.navigateBack({
                    delta: 1
                })
            },
            formSubmit(e) {
                let data = e.detail.value
                for (let key in data) {
                    if (!data[key]) {
                        uni.showToast({
                            title: '表单项不能为空',
                            icon: 'none',
                            duration: 2000
                        })
                        return
                    }
                }
                data.employeeId = this.employee.id
                this.$httpForm.post('/wechat/employee/saveAddress.json', data).then((res) => {
                    console.log(res)
                    if (res.data.code == 'SUCCESS') {
                        uni.showToast({
                            title: '保存成功',
                            icon: 'success',
                            complete: function() {
                                uni.navigateBack({
                                    delta: 1
                                })
                            }
                        })
                    } else {
                        uni.showToast({
                            title: res.data.message,
                            icon: 'none',
                            duration: 2000
                        })
                    }
                })
            },
            getAddress() {
                let that = this
                this.$http.get('/wechat/employee/getAddress.json', {
                	data: {
                		employeeId: that.employee.id
                	}
                }).then((res) => {
                	if (res.data.entity) {
                		that.detail = res.data.entity.detail
                        that.contact = res.data.entity.contact
                        that.phone = res.data.entity.phone
                	}
                })
            }
        },
        onShow() {
            this.getAddress()
        }
    }
</script>

<style>
</style>
