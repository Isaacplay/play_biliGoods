<template>
  <div>
    <div class="filter-header">
        <div class="filter-header-top">
          <div class="filter-header-left">
            <div class="filter-item">
              <div class="filter-name">间隔:</div>
              <el-input v-model="step" style="width: 40px;"/>
            </div>
          </div>
          <div class="filter-header-right">
            <el-button color="#626aef" @click="stop">停止</el-button>
            <el-button color="#626aef"  plain @click="start">启动</el-button>
          </div>
      </div>
    </div>
    <div ref="container" class="filter-con">
      <div class="filter-con-item" v-for="(item,index) in interval.log" :key="index">
        {{ item }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref,reactive ,onMounted} from 'vue'
import { ElMessage  } from 'element-plus'
const step = ref(3)
const interval = reactive({
  'play':null,
  'goodsList':[],
  'nextId' : '',
  'log':[]
})
onMounted(() => {
  bilibiliGoodsSearch()
})
function stop(){
  clearInterval(interval.play)
}
function start(flag = true){
  if(flag){
    interval.log = []
  }
  let time = Number(step.value) * 1000
  interval.play = setInterval(()=>{
    bilibiliGoodsSearch()
  },time)
}

function bilibiliGoodsSearch(){
  interval.goodsList = []
  let data = {
    nextId:interval.nextId.length == 0?null:interval.nextId,
  }
  $.ajax({
    type: "POST",
    url: 'https://mall.bilibili.com/mall-magic-c/internet/c2c/v2/list',
    timeout: 20000,
    headers : {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
    success: function (res) {
      try {
          //在此运行代码
          if(!res) { return }
          if(res.code == 0){
              //精简内容 优化 数组
              res.data.data = res.data.data.map((item)=>{
                  let itemsId = item.detailDtoList.map((itema)=>{
                      return itema.skuId
                  })
                  item.itemsId = itemsId.sort().join(',')
                  return item
              })
              interval.goodsList = res.data.data
              analysisAction()
          }
      }
      catch(err){
        console.log(err)
          //在此处理错误
          console.log('我被ban啦QAQ')
          interval.log.push('我被ban啦QAQ,冷却10min')
          stop()
          setTimeout(()=>{
            start(false)
          },10 * 60 * 1000)
      }
    },
    error:function (res) {
      console.log(res)
    }
  });
}
const container = ref<any>(null)
function analysisAction(){
  let arrary = interval.goodsList
  for(let i of arrary){
      for(let t of checkList.value){
          if(i.itemsId == t.itemsId){
            console.log(i.c2cItemsName+' 现在的价格：'+i.showPrice+' 期望价格：'+t.price)
            // interval.log.push(i.c2cItemsName+' 现在的价格：'+i.showPrice+' 期望价格：'+t.price)
            if(Number(i.showPrice) <= Number(t.price)){
                console.log(`${i.c2cItemsName} 现在价格是${i.showPrice},开始查询商品详情`);
                interval.log.push(`${i.c2cItemsName} 现在价格是${i.showPrice},开始查询商品详情`)     
                getItemInfo(i.c2cItemsId)
            }
          }
      }
  } 
  // container.scrollTop = container.scrollHeight;
}

function getItemInfo(id){
  $.ajax({
    type: "GET",
    url: `https://mall.bilibili.com/mall-magic-c/internet/c2c/items/queryC2cItemsDetail?c2cItemsId=${id}`,
    timeout: 20000,
    headers : {
      "Content-Type": "application/json",
    },
    success: function (res) {
      console.log(res)
      if (res.code === 0) {
          lockBill(res.data)
      } else {
          console.log(`查询商品详情失败`);
          interval.log.push("查询商品详情失败")
      }
    },
    error:function (res) {
      console.log(res)
    }
  });
}

function lockBill(item){
    console.log('开始锁单！！！！！！！！！')
    interval.log.push("开始锁单！！！！！！！")
    let data = {
      "source":"",
      "returnUrl":`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${item.c2cItemsId}&from=market_mine`,
      "recId":`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${item.c2cItemsId}&from=market_mine`,
      "payTotalMoneyAll":Number(item.showPrice),
      "notifyPhone":"17714381606",
      "from":"",
      "failUrl":`https://mall.bilibili.com/neul-next/index.html?page=magic-market_detail&noTitleBar=1&itemsId=${item.c2cItemsId}&from=market_mine`,
      "deviceInfo":"WEB",
      "deviceType":2,
      "orderItems":{
          "c2cItemsId":item.c2cItemsId,
          "price":item.price,
          "showPrice":item.showPrice,
          "c2cItemsName":item.c2cItemsName,
          "c2cItemsImg":null,
          "remainSecond":item.remainSecond,
          "subItemsList":item.detailDtoList.map((subItem)=>{
              let map = {
                  "blindBoxId": subItem.blindBoxId,
                  "subItemsSukId": subItem.skuId,
                  "subItemsSkuName": subItem.name,
                  "subItemsSkuImg": subItem.img,
                  "marketPrice": subItem.showMarketPrice,
                  "subItemsId": subItem.itemsId
              }
              return map
          })
      },
      "userinfo":{"id":101,"uid":null,"status":null,"provId":320000,"cityId":320100,"areaId":320105,"def":null,"name":"彭磊","phone":"17714381606","addr":"清润园","zipCode":null,"prov":"江苏省","city":"南京市","area":"建邺区","check":null}
    };
    $.ajax({
      type: "POST",
      url: `https://mall.bilibili.com/magic-c/c2c/order/create?buvid=C8D14199-DF6A-662E-BA20-623D70997D4663385infoc&platform=h5&uid=2054000&channel=1&vtoken=&client-type=hyg`,
      timeout: 20000,
      headers : {
          "Content-Type": "application/json",
          'Cookie': "buvid4=A1ED690D-5969-BB2D-172D-2492750CEAF479304-022012420-k9ghmlaJ08frE7XQuRgsaA%3D%3D; buvid3=C8D14199-DF6A-662E-BA20-623D70997D4663385infoc; b_nut=1688824963; _uuid=451F12106-7529-194A-92ED-7AE391CDCED477125infoc; buvid_fp=7dfa9df13abda875ef37de972e4c8ac8; i-wanna-go-back=-1; FEED_LIVE_VERSION=V8; header_theme_version=CLOSE; home_feed_column=5; browser_resolution=1920-937; bp_video_offset_60992100=815121699715416000; b_ut=7; CURRENT_FNVAL=4048; PVID=1; _xid=FHAFTGq0hKQDOd4ABIy0U8Nio4P3f1WdUX4ECoHDej9yXx6lS%5CL0chxhu5h5YeUXWHTF8TdEEdXsW97CFKocAIgXfgpCkE51Xq8i25mKhsrchzWCJRTp9H0pG6q1hmTM; c=eRbDYplN-1689175473786-78e74bc9df84f-1154266463; _fmdata=ZinRxYuAJdwkej9VK44V4XYzoNDhxz57%5CjfJCOeqjG99DMApT2HKksVCeo5PgFP2U94uAqGI8h0Ya7ZfutqgIB8IjZkYbhcObzhU50iyFaMdx5PGG74Iso5vmM4uNXpm; Hm_lvt_8d8d2f308d6e6dffaf586bd024670861=1689313661,1689418725,1689815012,1689862587; innersign=0; b_lsid=96CA953E_18975E69BDB; SESSDATA=cbaf582a%2C1705452210%2C69da0%2A72nt_kW5oOS3UDBUMtlGnU5h2VlUBKpyRR82bQen6KOxpzuSPNkSri78EaL0BfFKnWNeJOwgAAAAA; bili_jct=471b719adc0d5b9ffd92a22e81245cac; DedeUserID=2054000; DedeUserID__ckMd5=eefb1a0b9f4fd657; sid=ovpy1ipb; bp_video_offset_2054000=820461778589712400"
      },
      data: JSON.stringify(data),
      success: function (res) {
        if(!res) { return }
        if(res.code == 0){
            let payParams  = escape(JSON.stringify(res.data.payInfo))
            console.log('锁单完成！！！！！！！！！payParams如下：')
            console.log('------------------------------------------------------------------------')
            console.log(payParams)
            console.log('------------------------------------------------------------------------')
            console.log('------------------------------------------------------------------------')
            let msg = `${item.c2cItemsName} 现在价格是${item.showPrice},锁单完成！！！！！！！！`
            interval.log.push(msg)
            $.get({url:`http://111.229.88.32:5701/send_private_msg?user_id=749975453&message=${msg}`,})  
            const options = {
                url: `http://111.229.88.32:5701/send_msg`,
                json: {
                    "message_type":"private",
                    "user_id":749975453,
                    "auto_escape":false,
                    "message":payParams
                },
                headers: {
                    "Content-Type": "application/json",
                }
            };
            $.post(options, (err, resp, res) => {});
        }else{
            if(res.code == 83001002){
                $.get({url:`http://111.229.88.32:5701/send_private_msg?user_id=749975453&message=登陆验证失败`,})
            }
            // $.get({url:`http://111.229.88.32:5701/send_private_msg?user_id=749975453&message=锁单失败QAQ`,})
            console.log('锁单失败',res)
        }
      },
      error:function (res) {
        console.log(res)
      }
    });
}

const checkList = ref(
  [
    {
    "name": " 2233 睡衣派对系列 流沙摇摇摆件 进阶大礼包",
    "itemsId": "1000346341",
    "price": 35
    },
  {
      "name": " F:NEX 初音未来  2021Ver. 手办 附独家特典",
      "itemsId": "1000146288",
      "price": 920
  },
  {
      "name": " F:NEX 初音未来  真夏花火Ver. 手办",
      "itemsId": "1000193068",
      "price": 850
  },
  {
      "name": " F:NEX 初音未来 2022新春 Ver. 手办",
      "itemsId": "1000140611",
      "price": 1000
  },
  {
      "name": " F:NEX 环彩羽 手办",
      "itemsId": "1000098945",
      "price": 450
  },
  {
      "name": " F:NEX 可可萝 6星Ver. 手办",
      "itemsId": "1000162298",
      "price": 950
  },
  {
      "name": " F:NEX 拉姆 白无垢ver. 手办 再版",
      "itemsId": "1000199867",
      "price": 550
  },
  {
      "name": " F:NEX 雷姆  蛋壳Ver. 手办",
      "itemsId": "1000167707",
      "price": 750
  },
  {
      "name": " F:NEX 雷姆 白无垢ver. 手办 再版 等2个商品",
      "itemsId": "1000199867,1000199900",
      "price": 1100
  },
  {
      "name": " F:NEX 雷姆 水球ver. 手办",
      "itemsId": "1000193780",
      "price": 950
  },
  {
      "name": " F:NEX 罗德尼 幸福殿堂Ver. 手办",
      "itemsId": "1000165294",
      "price": 999
  },
  {
      "name": " F:NEX 雅儿贝德 浴衣ver.  手办 再版",
      "itemsId": "1000193771",
      "price": 400
  },
  {
      "name": " F:NEX 中野二乃 白无垢Ver. 手办",
      "itemsId": "1000159826",
      "price": 900
  },
  {
        "name": "2233 拜年纪2021 限定Ver.手办 进阶大礼包",
        "itemsId": "1000355405",
        "price": 900
    },
  {
      "name": "哔哩哔哩 阿梓 手办",
      "itemsId": "1000140242",
      "price": 95
  },
  {
      "name": "哔哩哔哩 虚拟主播 白神遥Haruka psplive 景品手办",
      "itemsId": "1000112889",
      "price": 95
  },
   {
        "name": "不知火 夜火离歌 手办&式波·明日香·兰格雷 Q版手办 进阶大礼包",
        "itemsId": "1000342868",
        "price": 850
    },
  {
      "name": "角川 拉姆 2021生日会 Ver. 手办",
      "itemsId": "1000143573",
      "price": 850
  },
  {
      "name": "角川 雷姆 2021生日会 Ver. 手办",
      "itemsId": "1000143572",
      "price": 850
  },
  {
      "name": "角川 雷姆 生日蛋糕Ver. 手办 再版",
      "itemsId": "1000080940",
      "price": 520
  },
   {
        "name": "角川 伊蕾娜 我的冒险谭ver. 手办",
        "itemsId": "1000276833",
        "price": 950
    },
  {
      "name": "角川 灼眼的夏娜 夏娜 20周年纪念 灼眼的美人ver. 手办 ",
      "itemsId": "1000266539",
      "price": 1100
  },
  {
      "name": "罗技G G304 英雄联盟-艾克 鼠标",
      "itemsId": "1000342390",
      "price": 140
  },
  {
      "name": "罗技G G304 英雄联盟-卢锡安 鼠标",
      "itemsId": "1000342391",
      "price": 140
  },
  {
      "name": "罗技G G304 英雄联盟-亚索 鼠标",
      "itemsId": "1000342393",
      "price": 140
  },
  {
      "name": "罗技G G304 英雄联盟-悠米 鼠标",
      "itemsId": "1000342392",
      "price": 140
  },
  {
      "name": "罗技G G304黑色 鼠标",
      "itemsId": "1000212071",
      "price": 140
  },
  {
      "name": "仟秋动漫 战术绵姬 手办",
      "itemsId": "1000338692",
      "price": 499
  },
  {
      "name": "擎苍 初音未来 荷塘嬉戏 Q版手办",
      "itemsId": "1000193096",
      "price": 150
  },
  {
      "name": "擎苍 初音未来 月西江 Q版手办",
      "itemsId": "1000221587",
      "price": 140
  },
  {
      "name": "擎苍 狐妖小红娘 涂山红红&涂山雅雅 西陵春晓 Q版手办",
      "itemsId": "1000121300",
      "price": 140
  },
  {
      "name": "世嘉  爱蜜莉雅&幼年期爱蜜莉雅 手办",
      "itemsId": "1000269878",
      "price": 700
  },
  {
      "name": "世嘉 爱蜜莉雅 大精灵帕克ver. 景品手办",
      "itemsId": "1000218847",
      "price": 70
  },
  {
      "name": "世嘉 保登心爱 景品手办",
      "itemsId": "1000277893",
      "price": 55
  },
  {
        "name": "世嘉 碧翠丝 大精灵帕克ver.   景品手办",
        "itemsId": "1000218849",
        "price": 70
    },
  {
      "name": "世嘉 初音未来 景品手办",
      "itemsId": "1000261305",
      "price": 49
  },
  {
      "name": "世嘉 拉姆  Nyatsu Day 景品手办",
      "itemsId": "1000268796",
      "price": 49
  },
  {
      "name": "世嘉 拉姆 大精灵帕克 景品手办 异色版",
      "itemsId": "1000277751",
      "price": 49
  },
  {
      "name": "世嘉 拉姆&幼年期拉姆 手办",
      "itemsId": "1000269870",
      "price": 650
  },
  {
      "name": "世嘉 雷姆 大精灵帕克 景品手办 异色版",
      "itemsId": "1000277750",
      "price": 49
  },
  {
      "name": "世嘉 雷姆 Nyatsu Day 景品手办",
      "itemsId": "1000261548",
      "price": 49
  },
  {
      "name": "世嘉 香风智乃 景品手办",
      "itemsId": "1000277905",
      "price": 58
  },
  {
      "name": "世嘉 SPM VOCALOID 初音未来 15周年 村上ゅぃち ver.景品手办",
      "itemsId": "1000152716",
      "price": 60
  },
  {
      "name": "寿屋 灰樱 手办",
      "itemsId": "1000199578",
      "price": 450
  },
  {
      "name": "寿屋 游戏王 火灵使 希塔 手办",
      "itemsId": "1000343234",
      "price": 700
  },
  {
      "name": "寿屋 游戏王 水灵使 艾莉娅 手办",
      "itemsId": "1000343231",
      "price": 700
  },
  {
        "name": "寿屋 NO GAME NO LIFE 游戏人生 白 手办 再版",
        "itemsId": "1000368742",
        "price": 340
    },
  {
      "name": "阅文好物 萧薰儿 少女 手办",
      "itemsId": "1000276195",
      "price": 190
  },
  {
      "name": "ALTER 黑色之心 手办 再版 ",
      "itemsId": "1000071211",
      "price": 700
  },
  {
      "name": "ALTER 可畏 手办",
      "itemsId": "1000130614",
      "price": 1350
  },
  {
      "name": "ALTER 天狼星 碧波青云Ver.手办",
      "itemsId": "1000074813",
      "price": 900
  },
  {
      "name": "Alumina 神崎兰子 祝宴的白姬ver.手办",
      "itemsId": "1000138625",
      "price": 580
  },
  {
      "name": "AMAKUNI 菈菈・萨塔琳・戴比路克 手办",
      "itemsId": "1000167363",
      "price": 550
  },
  {
      "name": "AmiAmi 志摩凛 足浴Ver.  手办 普通版",
      "itemsId": "1000172017",
      "price": 500
  },
  {
        "name": "AniGift  花园Serena 手办",
        "itemsId": "1000154067",
        "price": 450
    },
  {
      "name": "AniMester大漫匠 爱蜜莉雅 故梦惊鸿ver 手办",
      "itemsId": "1000217167",
      "price": 800
  },
  {
      "name": "AniMester大漫匠 雷姆 故梦惊鸿ver 手办",
      "itemsId": "1000217168",
      "price": 750
  },
  {
        "name": "AniMester大漫匠 侍酒女郎-辛西娅·Cynthia 追视眼 手办",
        "itemsId": "1000354537",
        "price": 125
    },
  {
      "name": "AniMester大漫匠 小恶魔Lilith 追视眼 手办",
      "itemsId": "1000277700",
      "price": 130
  },
  {
      "name": "ANIPLEX+ 亚丝娜 手办",
      "itemsId": "1000123360",
      "price": 580
  },
  {
      "name": "ANIPLEX+ 樱岛麻衣 婚纱异色版ver. 手办",
      "itemsId": "1000138115",
      "price": 500
  },
  {
      "name": "AOWOBOX  皮洛莎 新年Ver. 手办",
      "itemsId": "1000355147",
      "price": 370
  },
  {
      "name": "APEX  初音未来 Pick Me Up 手办",
      "itemsId": "1000061191",
      "price": 480
  },
  {
      "name": "APEX 95式 春杪梦鸢人 Ver.  正比手办",
      "itemsId": "1000340202",
      "price": 350
  },
  {
      "name": "APEX 碧蓝航线 JUUs时间 鹩 Q版手办",
      "itemsId": "1000193277",
      "price": 140
  },
  {
      "name": "APEX 花园 白雪之仪Ver. 手办",
      "itemsId": "1000351370",
      "price": 1150
  },
  {
      "name": "APEX 露西亚·鸦羽 朱云流霭Ver. 手办",
      "itemsId": "1000366831",
      "price": 620
  },
  {
        "name": "APEX 萨拉托加 手办",
        "itemsId": "1000120464",
        "price": 650
    },
  {
      "name": "APEX 闪灵 手办",
      "itemsId": "1000177066",
      "price": 500
  },
  {
      "name": "APEX 貅 Q版手办",
      "itemsId": "1000336926",
      "price": 105
  },
  {
      "name": "APEX 鹬 散花舞鹤Ver. 手办",
      "itemsId": "1000276639",
      "price": 480
  },
  {
      "name": "Aurora Studio 上抚未靜 正比手办",
      "itemsId": "1000339591",
      "price": 380
  },
  {
      "name": "BANPRESTO 杜野凛世 景品",
      "itemsId": "1000154227",
      "price": 49
  },
  {
      "name": "BANPRESTO 拉姆 睡衣Ver. 景品手办",
      "itemsId": "1000135032",
      "price": 55
  },
  {
      "name": "BANPRESTO 雷姆 睡衣Ver. 景品 再版",
      "itemsId": "1000135030",
      "price": 55
  },
  {
      "name": "BANPRESTO 由比滨结衣 景品手办",
      "itemsId": "1000357061",
      "price": 55
  },
  {
      "name": "BANPRESTO 中野五月 金丝雀Ver. 景品手办",
      "itemsId": "1000140312",
      "price": 65
  },
  {
      "name": "BANPRESTO 朱菜 景品手办",
      "itemsId": "1000352699",
      "price": 60
  },
  {
    "name": "BeBox 洛天依 十周年纪念 拾光ver.  手办",
    "itemsId": "1000196956",
    "price": 799
},
{
    "name": "BEMOE Vsinger 洛天依 2023生日纪念系列 亚克力流沙立牌",
    "itemsId": "1000365338",
    "price": 45
},
{
    "name": "BEMOE Vsinger 洛天依 亚克力流沙立牌 祭司",
    "itemsId": "1000350412",
    "price": 45
},
{
    "name": "BEMOE Vsinger 洛天依 亚克力流沙立牌 恋人",
    "itemsId": "1000350411",
    "price": 45
},
  {
      "name": "BILIBILIGOODS 茉莉  Q版手办",
      "itemsId": "1000132060",
      "price": 140
  },
  {
      "name": "Brilliant Journey! 光辉 钟情春日Ver. 手办",
      "itemsId": "1000167104",
      "price": 799
  },
  {
      "name": "BROCCOLI RIDDLE JOKER 三司绫濑 手办 再版 ",
      "itemsId": "1000354552",
      "price": 620
  },
  {
      "name": "CAWorks 弗拉迪蕾娜·米丽洁 泳装ver. 手办",
      "itemsId": "1000148545",
      "price": 450
  },
  {
      "name": "CAWorks 古手川唯 海滨的风Ver. 手办",
      "itemsId": "1000153823",
      "price": 600
  },
  {
      "name": "Chara-ani 金色之暗 水手服泳装Ver. 手办",
      "itemsId": "1000123198",
      "price": 410
  },
  {
    "name": "Claynel 克洛伊 居家服Ver. 手办",
    "itemsId": "1000349906",
    "price": 1050
},
{
    "name": "Claynel 伊莉雅  居家服Ver. 手办",
    "itemsId": "1000349905",
    "price": 1050
},
  {
      "name": "elCOCO 国见玉 手办",
      "itemsId": "1000336489",
      "price": 80
  },
  {
      "name": "Ensoutoys 纯真魅魔 莉兹 手办",
      "itemsId": "1000355631",
      "price": 620
  },
  {
    "name": "F:NEX  由崎司 白无垢ver. 手办",
    "itemsId": "1000276240",
    "price": 899
},
  {
      "name": "F:NEX × POPPRO VOCALOID 初音未来 2023新春ver. 手办",
      "itemsId": "1000253391",
      "price": 899
  },
  {
      "name": "F:NEX 明日方舟 泥岩 静谧午夜 DN06 VER. 手办",
      "itemsId": "1000280267",
      "price": 720
  },
  {
      "name": "F:NEX 魔女之旅 伊蕾娜 针织连衣裙ver. 手办",
      "itemsId": "1000345587",
      "price": 580
  },
  {
      "name": "F:NEX 苏菲的炼金工房2 ～不可思议梦的炼金术士～ 苏菲 婚纱ver. 手办",
      "itemsId": "1000256072",
      "price": 960
  },
  {
      "name": "F:NEX 游戏王 我我我少女 手办",
      "itemsId": "1000264648",
      "price": 700
  },
  {
    "name": "F:NEX NO GAME NO LIFE 游戏人生 白 白无垢ver. 手办",
    "itemsId": "1000346580",
    "price": 800
},
  {
      "name": "F:NEX Re：从零开始的异世界生活 拉姆 花魁Ver. 手办",
      "itemsId": "1000106609",
      "price": 800
  },
  {
      "name": "F:NEX Re:从零开始的异世界生活 雷姆&拉姆 手办",
      "itemsId": "1000264236",
      "price": 1500
  },
  {
      "name": "FLARE Fate/Grand Order 高扬斯卡娅 旗袍ver. 手办",
      "itemsId": "1000266381",
      "price": 750
  },
  {
      "name": "Flash Point 梅 普通版 手办",
      "itemsId": "1000140770",
      "price": 350
  },
  {
      "name": "FREEing 拉芙塔莉雅 幼年化兔女郎Ver. 手办",
      "itemsId": "1000359529",
      "price": 1600
  },
  {
    "name": "FuRyu  伊蕾娜 手办 ",
    "itemsId": "1000204602",
    "price": 180
},
  {
      "name": "FuRyu  中野二乃 手办",
      "itemsId": "1000218744",
      "price": 199
  },
  {
      "name": "FuRyu 初音未来  粉蝶花精灵 泡面压 景品手办 再版",
      "itemsId": "1000260200",
      "price": 55
  },
  {
      "name": "FuRyu 初音未来 粉蝶花精灵 泡面压 景品手办 ",
      "itemsId": "1000166090",
      "price": 55
  },
  {
      "name": "FuRyu 初音未来 景品手办",
      "itemsId": "1000280618",
      "price": 65
  },
  {
      "name": "FuRyu 初音未来 秋日之约 景品手办",
      "itemsId": "1000350289",
      "price": 65
  },
  {
      "name": "FuRyu 初音未来 圣诞糖果 景品手办",
      "itemsId": "1000355718",
      "price": 65
  },
  {
      "name": "FuRyu 初音未来 Dark 手办 ",
      "itemsId": "1000154093",
      "price": 110
  },
  {
      "name": "FuRyu 中野三玖 正比手办",
      "itemsId": "1000271404",
      "price": 199
  },
  {
      "name": "FuRyu 中野一花 正比手办",
      "itemsId": "1000266456",
      "price": 199
  },
  {
      "name": "GOLDEN HEAD 碧蓝航线 光辉 μ兵装 手办",
      "itemsId": "1000258012",
      "price": 1600
  },
  {
      "name": "GOOD SMILE ARTS SHANGHAI 斯洛卡伊 手办",
      "itemsId": "1000114505",
      "price": 380
  },
  {
      "name": "GOOD SMILE COMPANY 光  手办 3次受注",
      "itemsId": "1000083720",
      "price": 750
  },
  {
      "name": "GSAS 柳梦璃 织梦行云Ver.  手办",
      "itemsId": "1000260556",
      "price": 750
  },
  {
      "name": "GSAS 洛天依  万物有灵ver. 手办",
      "itemsId": "1000221621",
      "price": 850
  },
  {
      "name": "GSAS 缪尔赛思 精英二 VER. 正比手办",
      "itemsId": "1000340765",
      "price": 999
  },
  {
      "name": "GSC 彼岸的新娘 手办",
      "itemsId": "1000147633",
      "price": 2600
  },
  {
      "name": "GSC 初音未来  NT风私服Ver. 手办",
      "itemsId": "1000336243",
      "price": 999
  },
  {
      "name": "GSC 初音未来 交响乐2022Ver. 手办",
      "itemsId": "1000354949",
      "price": 879
  },
  {
      "name": "GSC 初音未来 交响乐5周年 手办",
      "itemsId": "1000116354",
      "price": 1199
  },
  {
    "name": "GSC 初音未来 Rose Cage Ver.  手办",
    "itemsId": "1000167227",
    "price": 950
},
  {
      "name": "GSC 美浦波旁  栗色的赛博格 手办",
      "itemsId": "1000269825",
      "price": 910
  },
  {
      "name": "GSC 异度神剑 焰 手办 3次受注",
      "itemsId": "1000083721",
      "price": 750
  },
  {
    "name": "GSC 终极圆神 手办 再版",
    "itemsId": "1000361947",
    "price": 699
},
  {
      "name": "GSC POP UP PARADE 朱菜  手办",
      "itemsId": "1000158946",
      "price": 120
  },
  {
      "name": "Hapitopi 淋湿的风纪委员  正比手办",
      "itemsId": "1000354156",
      "price": 130
  },
  {
      "name": "Hobbymax 应瑞 寒松雪暖Ver. 手办",
      "itemsId": "1000354523",
      "price": 800
  },
  {
      "name": "Hobbymax 肇和 花枝映梅Ver. 手办",
      "itemsId": "1000354524",
      "price": 850
  },
  {
      "name": "Hobbymax AK-12 无冬咏叹调 Ver. 手办",
      "itemsId": "1000107563",
      "price": 550
  },
  {
      "name": "Hobbymax AN-94 狼与赋格 Ver. 手办",
      "itemsId": "1000107562",
      "price": 650
  },
  {
      "name": "Knead 黛朵 重装版 手办",
      "itemsId": "1000133871",
      "price": 1200
  },
  {
      "name": "Knead 黛朵轻装版 手办",
      "itemsId": "1000133870",
      "price": 700
  },
  {
      "name": "Knead 企业 誓约的星光Ver. 手办",
      "itemsId": "1000071895",
      "price": 450
  },
  {
      "name": "KT model+ Fate/Samurai Remnant 宫本武藏 Berserker 手办",
      "itemsId": "1000355697",
      "price": 850
  },
  {
      "name": "MAGI ARTS 游戏王 怪兽之决斗 黑魔导女孩 手办",
      "itemsId": "1000209805",
      "price": 800
  },
  {
      "name": "Max Factory 初音未来 RACING MIKU 2021 Private Ver. 正比手办",
      "itemsId": "1000270788",
      "price": 1300
  },
  {
      "name": "Max Factory 雪未来 冬丽 ver.  可动手办",
      "itemsId": "1000255475",
      "price": 400
  },
  {
      "name": "maxcute 口罩少女-尤娜 手办",
      "itemsId": "1000261791",
      "price": 350
  },
  {
      "name": "MegaHouse 黑魔导女孩 手办",
      "itemsId": "1000367120",
      "price": 920
  },
  {
      "name": "MIMEYOI 碧蓝航线 标枪 幸福纯白ver, 手办",
      "itemsId": "1000361213",
      "price": 700
  },
  {
      "name": "MIMEYOI 布莱默顿 炙热的网球练习Ver.  手办 通常版",
      "itemsId": "1000150766",
      "price": 599
  },
  {
      "name": "MIMEYOI 布莱默顿 炙热的网球练习Ver. 限定版 手办",
      "itemsId": "1000150767",
      "price": 599
  },
  {
    "name": "Miyuki 长门有希 手办",
    "itemsId": "1000360914",
    "price": 840
},
  {
      "name": "Myethos [C] 手办",
      "itemsId": "1000134767",
      "price": 430
  },
  {
      "name": "neonmax 应瑞 手办",
      "itemsId": "1000123807",
      "price": 830
  },
  {
      "name": "neonmax 肇和 手办 特典版",
      "itemsId": "1000168616",
      "price": 830
  },
  {
    "name": "Onmyoji阴阳师 不知火  夜火离歌 手办",
    "itemsId": "1000139765",
    "price": 850
},
  {
      "name": "Phat!  白&休比   手办 ",
      "itemsId": "1000098704",
      "price": 1150
  },
  {
      "name": "Phat! 爱蜜莉雅  婚纱Ver. 手办 再版",
      "itemsId": "1000195295",
      "price": 600
  },
  {
      "name": "Phat! 白 手办",
      "itemsId": "1000089768",
      "price": 600
  },
  {
    "name": "Phat! 白 夏季Ver.  手办",
    "itemsId": "1000056975",
    "price": 650
},
  {
      "name": "Phat! 葛饰北斋 手办",
      "itemsId": "1000045137",
      "price": 1600
  },
  {
      "name": "Phat! 加藤惠 手办",
      "itemsId": "1000354541",
      "price": 599
  },
  {
      "name": "Phat! 洛琪希·米格路迪亚 手办",
      "itemsId": "1000120324",
      "price": 999
  },
  {
      "name": "Phat! 斯卡哈  第一再临 手办",
      "itemsId": "1000123003",
      "price": 700
  },
  {
      "name": "Phat! 休比·多拉  手办 再版",
      "itemsId": "1000083896",
      "price": 600
  },
  {
      "name": "Phat! 约会大作战 冰芽川四糸乃 反转ver. 手办",
      "itemsId": "1000047542",
      "price": 599
  },
  {
      "name": "Phat! DP-12 花月夜行灯 手办",
      "itemsId": "1000139058",
      "price": 580
  },
  {
      "name": "Plum  橘爱丽丝 初次展露的表情ver. 手办 再版",
      "itemsId": "1000264940",
      "price": 420
  },
  {
      "name": "Plum 保登心爱 夏日祭Ver. 手办 再版",
      "itemsId": "1000155626",
      "price": 580
  },
  {
      "name": "Plum 偶像大师 灰姑娘女孩 游佐梢 甜蜜小仙子Ver. 手办 再版",
      "itemsId": "1000267949",
      "price": 430
  },
  {
      "name": "Plum 偶像大师 灰姑娘女孩U149 橘爱丽丝 手办",
      "itemsId": "1000274743",
      "price": 650
  },
  {
      "name": "Prime 1 Studio 白 手办",
      "itemsId": "1000152551",
      "price": 1100
  },
  {
      "name": "PROOF 魔女之旅 伊蕾娜 手办",
      "itemsId": "1000369660",
      "price": 850
  },
  {
      "name": "quesQ G36 手办",
      "itemsId": "1000137267",
      "price": 599
  },
  {
      "name": "Reverse Studio  赵灵儿 拾花集 仙灵仙踪 ver. 手办",
      "itemsId": "1000355313",
      "price": 738
  },
  {
      "name": "Reverse Studio 樱木真乃  花风Smiley ver. 手办",
      "itemsId": "1000349780",
      "price": 420
  },
  {
      "name": "RIBOSE 温蒂 庆典时光 VER. 手办",
      "itemsId": "1000279610",
      "price": 110
  },
  {
      "name": "RIBOSE RISE UP 明日方舟 阿米娅 庆典时光Ver. 手办 再版",
      "itemsId": "1000279535",
      "price": 120
  },
  {
    "name": "Ryu-NS 菈菈・萨塔琳・戴比路克 泳装Ver. 手办 再版",
    "itemsId": "1000074936",
    "price": 450
},
  {
      "name": "Solarain  Bibi 啦啦队兔女郎 ver.  手办",
      "itemsId": "1000259637",
      "price": 550
  },
  {
      "name": "Solarain 福丸小糸 子夜怪物 Ver.手办",
      "itemsId": "1000340027",
      "price": 600
  },
  {
      "name": "SSF 少女前线 UKM-2000 急速风流 重创Ver. 手办",
      "itemsId": "1000275945",
      "price": 800
  },
  {
    "name": "SSF 五等分的新娘 中野二乃 Floral Dress Ver. 手办",
    "itemsId": "1000268777",
    "price": 850
},
  {
      "name": "SSF 五等分的新娘 中野三玖 Floral Dress Ver. 手办",
      "itemsId": "1000280133",
      "price": 850
  },
  {
      "name": "SSF 五等分的新娘 中野四叶 Floral Dress Ver. 手办",
      "itemsId": "1000259593",
      "price": 850
  },
  {
      "name": "Stronger 亚丝娜 偶像Ver. 手办 再版",
      "itemsId": "1000030603",
      "price": 380
  },
  {
      "name": "TAITO 初音未来  3rd season spring Ver. 景品 再版",
      "itemsId": "1000117401",
      "price": 60
  },
  {
      "name": "TAITO 初音未来 3rd season Summer ver.景品 再版",
      "itemsId": "1000114473",
      "price": 60
  },
  {
      "name": "TAITO 初音未来 小美人鱼Ver.  景品手办 再版",
      "itemsId": "1000348277",
      "price": 75
  },
  {
      "name": "TAITO 初音未来 长发公主Ver. 景品 独家二次再版",
      "itemsId": "1000154403",
      "price": 75
  },
  {
      "name": "TAITO 初音未来 sporty 景品手办",
      "itemsId": "1000359946",
      "price": 74
  },
  {
    "name": "TAITO 雷姆 中式连衣裙Ver. 景品手办 再版",
    "itemsId": "1000354107",
    "price": 70
},
  {
      "name": "TAITO 洛天依 小厨娘Ver. 景品手办",
      "itemsId": "1000359923",
      "price": 65
  },
  {
      "name": "TAITO 雅儿贝德 黑礼服 ver. 景品手办",
      "itemsId": "1000278243",
      "price": 75
  },
  {
      "name": "TAITO 中野五月 Cat room wear ver. 景品手办",
      "itemsId": "1000367594",
      "price": 65
  },
  {
      "name": "Union Creative 白 手办",
      "itemsId": "1000130809",
      "price": 300
  },
  {
      "name": "Union Creative 出包王女 菈菈・萨塔琳・戴比路克 Darkness 手办 再版",
      "itemsId": "1000271679",
      "price": 420
  },
  {
      "name": "Union Creative 出包王女DARKNESS 西连寺春菜 Darkness ver.1/6 手办 普通款",
      "itemsId": "1000123221",
      "price": 399
  },
  {
      "name": "Union Creative 初濑伊纲 手办",
      "itemsId": "1000130814",
      "price": 300
  },
  {
      "name": "Union Creative 赫敏 泳装Ver. 手办",
      "itemsId": "1000166639",
      "price": 520
  },
  {
      "name": "Union Creative 红发女孩 手办",
      "itemsId": "1000118243",
      "price": 420
  },
  {
      "name": "Union Creative 后辈女孩 手办",
      "itemsId": "1000118244",
      "price": 450
  },
  {
      "name": "Union Creative 雷姆 婚礼 Ver. 手办",
      "itemsId": "1000146438",
      "price": 450
  },
  {
      "name": "Union Creative 马尾辫女孩 手办",
      "itemsId": "1000118242",
      "price": 400
  },
  {
      "name": "Union Creative 猫 手办 附特典色纸",
      "itemsId": "1000132231",
      "price": 580
  },
  {
      "name": "Union Creative 娜娜·阿丝达·戴比路克 Darkness Ver. 手办",
      "itemsId": "1000115778",
      "price": 420
  },
  {
      "name": "Union Creative 水濑渚 手办",
      "itemsId": "1000149132",
      "price": 399
  },
  {
      "name": "Union Creative 西连寺春菜 Darkness ver.  手办",
      "itemsId": "1000123222",
      "price": 400
  },
  {
      "name": "Union Creative 雅儿贝德 so-bin Ver. 手办 再版",
      "itemsId": "1000153990",
      "price": 450
  },
  {
      "name": "Union Creative 伊莉丝 手办",
      "itemsId": "1000146589",
      "price": 499
  },
  {
      "name": "Union Creative 原创 一夜酱 手办",
      "itemsId": "1000274191",
      "price": 520
  },
  {
      "name": "Union Creative 原创 Biya原画 尤娜酱 手办",
      "itemsId": "1000316450",
      "price": 400
  },
  {
      "name": "Union Creative 原创 Thea 手办",
      "itemsId": "1000218591",
      "price": 420
  },
  {
      "name": "WAVE 碧蓝航线 天狼星 纯白蔷薇ver. 手办",
      "itemsId": "1000359585",
      "price": 650
  },
  {
      "name": "Wing A-Z:[A] 手办",
      "itemsId": "1000269817",
      "price": 1300
  },
  {
      "name": "WINGSinc. 佩内洛珀 盐系女仆ver. 手办",
      "itemsId": "1000206568",
      "price": 650
  },
  {
      "name": "WINGSinc. 少女前线 刘易斯 迎寒客 Ver. 手办",
      "itemsId": "1000252318",
      "price": 510
  },
  {
      "name": "WINGSinc. 一色彩羽 手办",
      "itemsId": "1000122916",
      "price": 520
  },
  {
      "name": "WINGSinc. Kanzarin 天使 索妮娅 手办",
      "itemsId": "1000316288",
      "price": 480
  },
  {
      "name": "WINGSinc. RFB 手办",
      "itemsId": "1000198395",
      "price": 420
  }
]
)

</script>
<style scoped>
.filter-header{
  padding: 24px; 
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  border-bottom: 1px solid rgb(235,235,235); 
  z-index: 999;
}
.filter-header-top{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-header-left{
  display: flex;
  flex-wrap: wrap;
}
.filter-name{
  font-size: 18px;
  margin-right: 24px;
  white-space: nowrap;
}
.filter-item{
  display: flex;
  align-items: center;
  margin-right: 24px;
}
.m-2{
  width: 180px;
}
.filter-header-right{
  align-items: center;
  display: flex;
}
.filter-header-right > div{
  margin-right: 24px;
}
.search-more{
  display: flex;
  padding: 12px 24px;
  align-items: center;
}
.filter-con{
  padding: 24px 6px;
  font-size: 12px;
}
.filter-con-item{
  margin-bottom: 8px;

}

</style>