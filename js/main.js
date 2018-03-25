function ready(infoData) {
  var vm = new Vue({
    el: '#app',
    data: {
      newToken: '',
      activeName: 'second', // 默认显示的tab
      selected_id: -1, // 所选中行的index值
      creating: false,
      updating: false,
      billType: ['fapiao1', 'fapiao2', 'fapiao3'],
      storeList: infoData.cache.store,
      logisticsList: infoData.cache.logistics_company,
      defaultName: { // 与后台交互的商铺信息
        title: '',
        app_key: '',
        app_secret: '',
        default_logistics_company_id: '',
        default_partner_id: '',
        default_employee_id: '',
        default_bank_id: '',
        default_store_id: '',
        default_bill_type: '',
        default_cross_store_id: ''
      },
      shopList: [ // 最终被渲染到页面的商铺列表
        {
          id: 1,
          name: '商铺1',
          partner: '伙伴1',
          employee: '员工1',
          store: '仓库1',
          bank: '银行1'
        },
        {
          id: 2,
          name: '商铺2',
          partner: '伙伴2',
          employee: '员工2',
          store: '仓库2',
          bank: '银行2'
        },
        {
          id: 3,
          name: '商铺3',
          partner: '伙伴3',
          employee: '员工3',
          store: '仓库3',
          bank: '银行3'
        }
      ]
    },
    methods: {
      getshoplist () {
        // 此处获取店铺列表ajax
        let _this = this
        axios({
          method: 'get',
          headers: {'Token': _this.newToken}
        }).then(function (res) {
          let root = res.data.root
          for (let i = 0; i < root.length; i++) {
            let row = root[i]
            _this.shopList.push({
              id: row.id,
              name: row.title,
              partner: infoData.cache.partner[row.default_partner_id].name,
              employee: infoData.cache.employee[row.default_employee_id].name,
              store: infoData.cache.store[row.default_store_id].name,
              bank: infoData.cache.bank[row.default_bank_id].name
            })
          }
          console.log('获取店铺ajax:', _this.shopList)
        }).catch(function (err) {
          console.log('获取店铺列表ajax:', err)
        })
      },
      close_dialog () {
        this.creating = false
        this.updating = false
        this.selected_id = -1
        this.clear_form()
      },
      open_create () {
        this.creating = true
      },
      on_submit () { // 提交创建请求
        // 判断店铺名称是否重复
        for (let i = 0; i<this.shopList.length; i++) {
          if(this.defaultName.title == this.shopList[i].name) {
            alert('店铺名称已存在,请勿重复创建')
            return
          }
        }
        //此处发送创建店铺ajax
        let _this = this
        axios({
          method: 'post',
          data: _this.defaultName,
          url: '/api/shops',
          headers: {'Token': _this.newToken}
        }).then(function (res) {
          if (res.data.state === 1) { //post成功时
            _this.shopList.push({
              id: res.data.id,
              name: res.data.title,
              partner: infoData.cache.partner[res.data.default_partner_id].name,
              employee: infoData.cache.employee[res.data.default_employee_id].name,
              store: infoData.cache.store[res.data.default_store_id].name,
              bank: infoData.cache.bank[res.data.default_bank_id].name
            })
          }
        }).catch(function (err) {
          console.log('创建店铺ajax:', err)
        })
      },
      clear_form () {
        this.defaultName = Object.assign(this.defaultName, this.defaultData)
      },
      handleClick (tab, event) {
        console.log(tab)
      },
      changeTo (index) {
        this.activeName = index // 点击导航切换tab
      },
      on_delete () { // 删除行
        let index = this.selected_id
        if (index === -1) {
          alert('请选择要删除的行')
        } else {
          this.delete_comfirm(index) //  确认要删除的店铺名
        }
      },
      delete_comfirm (index) {
        let confirmName = prompt('请确认您要删除的网店的名称', '')
        if (confirmName === this.shopList[index].name) {
          // 确认商铺名称后发送 发送删除ajax
          let _this = this
          axios({
            method: 'delete',
            url: '/api/shops/' + _this.shopList[index].id,
            headers: {'Token': _this.newToken}
          }).then(function(res) {
            if (res.data.state === 1) { // 成功时执行删除和单选重置
              _this.shopList.splice(index, 1)
              _this.selected_id = -1
            }
          }).catch(function(err) {
            console.log('删除商铺信息ajax:', err)
          })
        } else {
          alert('输入不一致')
        }
      },
      open_update () {
        let index = this.selected_id
        if (index === -1) {
          alert('请选择要编辑的行')
        } else {
          this.updating = true
          // 获取该id的店铺信息 两个ajax注意先后顺序


        }
      },
      on_update () { //修改行
        // 此处修改店铺ajax
        let _this =  this,
            index = this.selected_id
        axios({
          method: 'put',
          url: '/api/shops/' + _this.shopList[index].id,
          data: _this.defaultName,
          headers: {'Token': _this.newToken}
        }).then(function (res) {
          if (res.data.state === 1) {
            let newrow = {
              id: res.data.id,
              name: res.data.title,
              partner: infoData.cache.partner[res.data.default_partner_id].name,
              employee: infoData.cache.employee[res.data.default_employee_id].name,
              store: infoData.cache.store[res.data.default_store_id].name,
              bank: infoData.cache.bank[res.data.default_bank_id].name
            }
            _this.shopList.splice(index, 1, newrow) // 用newrow替换第index行
            _this.selected_id = -1
          }
        }).catch(function (err) {
          console.log('修改店铺ajax:', err)
        })
      }
    },
    mounted () {
      this.defaultData = JSON.parse(JSON.stringify(this.defaultName)) // 保存初始的空表单信息用来在关闭后清空
      this.getshoplist()
      // 获取新token
      var _this = this
      axios({
        method: 'get',
        url: '/api/access_token',
        params: {
          url: "http://s05.c8erp.com:6320",
          set_of_book: infoData.user.set_of_book,
          user_name: infoData.user.name
        },
        headers: {'Token': infoData.user.token}
      }).then(function (res) {
        console.log(res.data.token)
        _this.newToken = res.data.token
      }).catch(function (err) {
        console.log(err)
      })
    }
  })


}
