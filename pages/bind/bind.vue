<template>
    <view>
        <uni-nav-bar left-icon="back" left-text="返回" :title="hasBind ? '解除绑定' : '一卡通绑定'" :fixed="true" :status-bar="true"
            @clickLeft="back"></uni-nav-bar>
        <form @submit="formSubmit">
            <view class="uni-form-item uni-column">
                <input :value="hasBind ? employee.name : ''" :disabled="hasBind" type="text" class="uni-input" name="name"
                    placeholder="请输入持卡人姓名" />
            </view>
            <view class="uni-form-item uni-column">
                <input :value="hasBind ? employee.employeeNo : ''" :disabled="hasBind" type="number" class="uni-input"
                    name="validateNo" placeholder="请输入持卡人工号或证件号" />
            </view>
            <view v-if="!hasBind" class="uni-form-item uni-column">
                <input type="number" :password="true" :maxlength="6" class="uni-input" name="payPassword" placeholder="请输入支付密码" />
                <view class="title">提示：如未设置密码无需填写</view>
            </view>
            <view class="uni-btn-v">
                <button v-if="hasBind" type="primary" form-type="submit">解除绑定</button>
                <button v-else type="primary" form-type="submit">立即绑定</button>
            </view>
        </form>
    </view>
</template>

<script>
    import {
        mapState,
        mapMutations
    } from 'vuex'

    export default {
        data() {
            return {

            }
        },
        computed: mapState(['hasBind', 'wxUserInfo', 'employee']),
        methods: {
            ...mapMutations(['bind', 'setEmployee']),
            back() {
                uni.navigateBack({
                    delta: 1
                })
            },
            formSubmit(e) {
                let data = e.detail.value
                if (this.hasBind) {
                    this.$httpForm.post('/wechat/bind/unBind.json', {
                        id: this.employee.id
                    }).then((res) => {
                        console.log(res)
                        if (res.data.code == 'SUCCESS') {
                            this.bind(false)
                            this.setEmployee({})
                            uni.showToast({
                                title: '解绑成功',
                                duration: 2000,
                                icon: 'success'
                            })
                            uni.reLaunch({
                                url: '/pages/index/index'
                            })
                        } else {
                            uni.showToast({
                                title: res.data.message,
                                duration: 2000,
                                icon: 'none'
                            })
                        }
                    })
                } else {
                    data.openid = this.wxUserInfo.openid
                    console.log(data)
                    this.$httpForm.post('/wechat/bind/bind.json', data).then((res) => {
                        console.log(res)
                        if (res.data.code == 'SUCCESS') {
                            this.bind(true)
                            this.setEmployee(res.data.entity)
                            uni.showToast({
                                title: '绑定成功',
                                icon: 'success'
                            })
                            uni.reLaunch({
                                url: '/pages/index/index'
                            })
                        } else {
                            uni.showToast({
                                title: res.data.message,
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    })
                }
            }
        }
    }
</script>

<style>
</style>
