# 为什么要开发这个模块?

OpenSIPS本身是支持对接多个rtpengine的。它有一个rtpengine的表。

表结构如下：

| id  | socket               | set_id |
| --- | ---                  | ---    |
| 0   | udp:192.168.2.3:7890 | 0      |
| 1   | udp:192.168.2.4:7890 | 0      |
| 2   | udp:192.168.2.5:7890 | 1      |
| 3   | udp:192.168.2.6:7890 | 1      |

根据这个表，我们可以看出rtpengine分为两组

- 0
    - udp:192.168.2.3:7890 
    - udp:192.168.2.4:7890 
- 1
    - udp:192.168.2.5:7890 
    - udp:192.168.2.6:7890 

我们在写OpenSIPS脚本的时候，一般这么写

```
# 选择组0
rtpengine_use_set("0");
rtpengine_offer();
```

这样的写法看起来挺好，但是在云环境，就无法避免的出现问题。因为每一个rtpengine还有一个对外的公网IP

| id  | socket               | set_id | inner_media_ip | out_media_ip |
| --- | ---                  | ---    | ---            | ---          |
| 0   | udp:192.168.2.3:7890 | 0      | 192.168.2.3    | 1.2.3.4      |
| 1   | udp:192.168.2.4:7890 | 0      | 192.168.2.4    | 1.2.3.5      |

例如下图，A是内网的一个SIP Server, B是处于云边界的具有公网IP的SIP Server, C是公网的另一个SIP

- 呼出
    - 在A -> B -> C 这个呼出的方向，B->C方向的信令 SDP部分的媒体IP应该是rtpengine的公网IP
- 呼入
    - 在C -> B -> A 这个呼入的方向，B->A方向的信令 SDP部分的媒体IP应该是rtpengine的内网IP

```
# 呼出
A ---> B(OpenSIPS+RTPENGINE) ----> C

# 呼入
A <--- B(OpenSIPS+RTPENGINE) <---- C
```

在一个OpenSIPS对接一个RTPENGINE的时候，RTPENGINE的内网地址和公网地址都是可以提前获取的。

但是在一个OpenSIPS对接多个RTPENGINE的时候，脚本里只是选择了组，无法通过`media-address=`去设置不同方向的媒体地址。

我也试过不设置media-address这个参数，但是这时候发现，SDP部分的IP地址，往往都是错误的。

因为分组是OpenSIPS的RTPENGINE模块去设置的，从组内具体选择哪一个可用的rtpengine的实例，也是这个模块自己实现的。

RTPENGINE的offer参数里有这个internal或者external的设置，但是实际上已经废弃。

> internal, external - these the old flags used to specify the direction of call. They are now obsolate, being replaced by the “in-iface=internal out-iface=external” configuration.

新的写法是: `in-iface=internal out-iface=external`, 但是这种写法，其实时双网卡模式下bridge的写法。SDP部分的IP虽然能正常，但是媒体处理在测试验证的时候，还是无法转发。

所以目前就剩下两个方案：

1. 给OpenSIPS的rtpengine模块增加这种功能，这种方式虽然最好，但是可能要修改表结构，对OpenSIPS的代码改动也比较大。另外就是我对C语言也不甚精通, 没啥信心。
2. 增加一个外部模块，专门来管理rtpengine,  这个模块和OpenSIPS之间使用http协议通信。这个方案相对简单，我也可以选择比较熟练的语言去写。


所以新的处理结构就变成:

```
OpenSIPS ---http---> rtp_cluster
```

然后由rtp_cluster来全权管理rtpengine或者rtpproxy实例


