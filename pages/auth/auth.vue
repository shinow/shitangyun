<template>
    <view>
        微信公众号授权中,请稍候
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
                appid: 'wx432d0610946db009',
                scope: ['snsapi_base', 'snsapi_userinfo']
            }
        },
        computed: mapState(['hasAuth', 'wxUserInfo']),
        methods: {
            ...mapMutations(['auth', 'bind', 'setWxUserInfo', 'setEmployee']),
            getUrlKey(name) {
                return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) ||
                    [, ""])[1].replace(/\+/g, '%20')) || null
            },
            toIndex() {
                uni.reLaunch({
                    url: '/pages/index/index'
                })
            },
            // 微信公众号授权
            wxAuthorize() {
                let link = window.location.href
                let code = this.getUrlKey('code')
                console.log(code)
                // 已经授权登录过的就不用再授权了
                if (this.hasAuth) {
                    this.toIndex()
                    return
                }
                // 如果拿到code，调用授权接口，没有拿到就跳转微信授权链接获取
                if (code) {
                    let that = this
                    // 调用后台接口，授权
                    this.$httpForm.post('/wechat/auth/getEmployeeInfo.json', {
                        code: code
                    }).then((res) => {
                        if (res.data.code == 'SUCCESS') {
                            if (res.data.entity) {
                                that.bind(true)
                                that.setEmployee(res.data.entity)
                            } else {
                                that.bind(false)
                            }
                            that.auth(true)
                            that.setWxUserInfo(res.data.data)
                            that.toIndex()
                        } else {
                            uni.showToast({
                                title: res.data.message,
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    })
                } else {
                    let appid = this.appid
                    //使用encodeURIComponent方法对对象进行字符串化和编码
                    let uri = encodeURIComponent(link)
                    //授权方式：scope[0]:'snsapi_base',scope[1]:snsapi_userinfo
                    let scope = this.scope[1]
                    let authURL =
                        `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${uri}&response_type=code&scope=${scope}&state=123#wechat_redirect`
                    window.location.href = authURL
                }
            }
        },
        onLoad(option) {
            let that = this
            uni.showModal({
                title: '确定授权吗',
                content: window.location.href,
                success: function(res) {
                    if (res.confirm) {
                        that.wxAuthorize()
                    } else if (res.cancel) {
                        console.log('用户点击取消');
                    }
                }
            })
            
        }
    }
</script>

<style>
</style>
