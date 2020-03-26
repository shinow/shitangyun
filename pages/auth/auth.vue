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
        methods: {
            ...mapMutations(['bind', 'setWxUserInfo', 'setEmployee']),
            /**
             * 根据参数名 获取 URL 路径中的参数  
             * @param {String} name 要读取的参数名称  
             */
            getUrlParam(name) {
                const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
                let url = window.location.href.split('#')[0]
                let search = url.split('?')[1]
                if (search) {
                    let r = search.substr(0).match(reg)
                    if (r !== null) {
                        return unescape(r[2])
                    }
                    return null
                } else {
                    return null
                }
            },
            toIndex() {
                // #ifdef H5
                sessionStorage.setItem('hasAuth', true)
                // #endif
                uni.reLaunch({
                    url: '/pages/index/index',
                })
            },
            // 微信公众号授权
            wxAuthorize() {
                let link = window.location.href
                let code = this.getUrlParam('code') // 地址解析  
                // 已经授权登录过的就不用再授权了
                // #ifdef H5
                if (sessionStorage.getItem('hasAuth')) {
                    this.toIndex()
                    return
                }
                // #endif
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
                    let scope = this.scope[0]
                    let authURL =
                        `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${uri}&response_type=code&scope=${scope}&state=123#wechat_redirect`
                    window.location.replace(authURL)
                }
            }
        },
        onLoad(option) {
            this.wxAuthorize()
        }
    }
</script>

<style>
</style>
