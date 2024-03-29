<template>
    <el-row class="home" :gutter="20" style="zoom: 0.9;">
        <!-- 左侧 -->
        <el-col :span="8" style="margin-top: 20px">
            <el-card shadow="hover" style="height: 40%;">
                <div class="user">
                    <img src="../../assets/images/user.png" alt="">
                    <div class="user-info">
                        <p class="name" style="margin-bottom: 15px;">TGE Draven</p>
                        <p class="role">Administrator</p>
                    </div>
                </div>
                <div class="login-info">
                    <p>上次登陆时间:<span>2011-05-28</span></p>
                    <p>上次登陆地点:<span>Shanghai</span></p>
                </div>
            </el-card>
            <el-card shadow="hover" style="margin-top: 20px; height: 57.5%;">
                <el-table :data="tableData">
                    <el-table-column v-for="(val, key) in tableLabel" :key="key" :prop="key" :label="val">
                    </el-table-column>
                </el-table>
            </el-card>
        </el-col>
        <!-- 右侧 -->
        <el-col :span="16" style="margin-top: 20px" class="right-num">
            <div class="num">
                <el-card shadow="hover" :body-style="{ display: 'flex', padding: 0 }" v-for="item in countData"
                    :key="item.name">
                    <component class="icons" :is="item.icon" :style="{ background: item.color }"></component>
                    <div class="detail">
                        <p class="num">${{ item.value }}</p>
                        <p class="txt">{{ item.name }}</p>
                    </div>
                </el-card>
            </div>
            <el-card shadow="hover" style="height: 280px;">
                <div ref="echart" style="height: 280px;"></div>
            </el-card>
            <div class="graph">
                <el-card shadow="hover" style="height: 260px;">
                    <div ref="userechart" style="height: 240px;"></div>
                </el-card>
                <el-card shadow="hover" style="height: 260px;">
                    <div ref="videoechart" style="height: 240px;"></div>
                </el-card>
            </div>
        </el-col>
    </el-row>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, reactive, ref } from 'vue';
// 导入 axios 异步调用
import axios from 'axios';
import * as echarts from 'echarts';

export default defineComponent({
    setup() {
        // 需要用 ref 初始一个数组
        const tableData = ref([]);
        const countData = ref([]);
        const tableLabel = {
            name: '课程',
            todayBuy: '今日购买',
            monthBuy: '本月购买',
            totalBuy: '总购买',
        }
        // proxy 类似于Vue2中的 this
        const { proxy } = getCurrentInstance();
        // Home 组件 左侧表格数据获取 async 异步
        const getTableList = async () => {
            // fastmock 线上 Mock数据
            // await axios.get("https://www.fastmock.site/mock/ab47677c244ebf7fff6a06ff4fefc5f0/api/home/getData").then((res) => {
            //     if (res.data.code === 200) {
            //         tableData.value = res.data.data;
            //     }
            // });
            tableData.value = await proxy.$api.getTableData();
        }
        // Home 组件 Count 数据获取
        const getCountData = async () => {
            countData.value = await proxy.$api.getCountData();
        }
        onMounted(() => {
            getTableList();
            getCountData();
            // 获取ecahrts表格数据
            getChartData();
        })
        // 关于echarts表格的渲染
        let xOPtions = reactive(
            {
                // 图例文字颜色
                textStyle: {
                    color: "#333",
                },
                grid: {
                    left: "20%",
                },
                // 提示框
                tooltip: {
                    trigger: "axis",
                },
                xAxis: {
                    type: "category", // 类目轴
                    data: [],
                    axisLine: {
                        lineStyle: {
                            color: "#17b3a3",
                        },
                    },
                    axisLabel: {
                        interval: 0,
                        color: "#333",
                    },
                },
                yAxis: [
                    {
                        type: "value",
                        axisLine: {
                            lineStyle: {
                                color: "#17b3a3",
                            },
                        },
                    },
                ],
                color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980", "#d87a80", "#8d98b3"],
                series: [],
            }
        );
        let pieOptions = reactive({
            tooltip: {
                trigger: "item",
            },
            color: [
                "#0f78f4",
                "#dd536b",
                "#9462e5",
                "#a6a6a6",
                "#e1bb22",
                "#39c362",
                "#3ed1cf",
            ],
            series: [],
        });
        let orderData = reactive({
            xData: [],
            series: [],
        });
        let userData = reactive({
            xData: [],
            series: []
        });
        let videoData = reactive({
            series: []
        });
        // 获取数据
        const getChartData = async () => {
            let result = await proxy.$api.getChartData();
            let orderRes = result.orderData;
            let userRes = result.userData;
            let videoRes = result.videoData;

            orderData.xData = orderRes.date
            const keyArray = Object.keys(orderRes.data[0])
            const series = []
            keyArray.forEach((key) => {
                series.push({
                    name: key,
                    data: orderRes.data.map(item => item[key]),
                    type: "line"
                });
            });
            orderData.series = series;
            xOPtions.xAxis.data = orderData.xData;
            xOPtions.series = orderData.series;
            // userData进行渲染
            let hEcharts = echarts.init(proxy.$refs['echart']);
            hEcharts.setOption(xOPtions)
            // 柱状图进行渲染
            userData.xData = userRes.map((item) => item.date);
            userData.series = [
                {
                    name: '新增用户',
                    data: userRes.map((item) => item.new),
                    type: "bar",
                },
                {
                    name: '活跃用户',
                    data: userRes.map((item) => item.active),
                    type: "bar",
                },
            ];
            xOPtions.xAxis.data = userData.xData;
            xOPtions.series = userData.series;
            // userData进行渲染
            let uEcharts = echarts.init(proxy.$refs['userechart']);
            uEcharts.setOption(xOPtions);
            videoData.series = [
                {
                    data: videoRes,
                    type: 'pie'
                }
            ];
            pieOptions.series = videoData.series
            let vEcharts = echarts.init(proxy.$refs['videoechart']);
            vEcharts.setOption(pieOptions);
        }
        return {
            tableData,
            tableLabel,
            countData // 返回之后才能在页面中使用
        }
    }
})
</script>

<style lang="less" scoped>
.home {
    margin-top: -40px;

    .user {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #ccc;
        margin-bottom: 20px;

        img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            margin-right: 40px;
        }
    }

    .login-info {
        p {
            line-height: 30px;
            font-size: 14px;
            color: #999;

            span {
                color: #666;
                margin-left: 60px;
            }
        }
    }

    .left-num {
        display: flex;
        flex-direction: column;
    }

    .right-num {

        .num {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;

            .el-card {
                width: 30%;
                margin-bottom: 20px;
            }

            .icons {
                width: 80px;
                height: 80px;
                font-size: 30px;
                text-align: center;
                line-height: 80px;
                color: #fff;
            }

            .detail {
                margin-left: 15px;
                display: flex;
                flex-direction: column;
                justify-content: center;

                .num {
                    font-size: 18px;
                    font-style: italic;
                    margin-bottom: 12px;
                }

                .txt {
                    font-size: 14px;
                    text-align: center;
                    color: #999;
                }
            }
        }
    }

    .graph {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;

        .el-card {
            width: 48%;
        }
    }
}
</style>