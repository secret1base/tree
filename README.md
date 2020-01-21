###	通过js实现的树形图插件

提供新增、编辑、删除、移动、搜索功能

``` javascript
    var file = [
      { id: "0", pid: "-1", title: "全部文件", sort: "0" },
      { id: "1", pid: "0", title: "我的爱好", sort: "4" },
      { id: "2", pid: "0", title: "我的音乐", sort: "3" },
      { id: "3", pid: "0", title: "我的电影", sort: "2" },
      { id: "4", pid: "0", title: "我的书籍", sort: "1" },
      { id: "11", pid: "1", title: "魔兽争霸", sort: "5" },
      { id: "12", pid: "1", title: "炉石", sort: "6" },
      { id: "41", pid: "4", title: "Emperor is Domination", sort: "8" },
      { id: "42", pid: "4", title: "吞噬星空", sort: "9" },
      { id: "43", pid: "4", title: "书籍", sort: "10" }
    ];

    let a = new Tree("#treebox", file);
    //下面三个方法可用于获取删除、编辑、移动节点的数值
    a.editExpand = function(node) {
      console.log("编辑----");
      console.log(node);
    };
    a.removeExpand = function(node) {
      console.log("删除---");
      console.log(node);
    };
    a.moveExpand = function(node) {
      console.log("移动---");
      console.log(node);
    };
    //获取当前树形数据
    let tree = a.getTreeData();
    //转换为原始数据
    a.parseOrign(tree);
```

