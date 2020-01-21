var treeData = [];
var paddingLeft = 20;
var changeNode;
var delNode;
var obj;
var shiftDown = 0;
var ctrlDown = 0;
class Tree {
  constructor(id, data) {
    obj = this;
    if (!data) {
      data = [
        {
          id: obj.generateId(),
          pid: obj.generateId(),
          title: "title",
          children: []
        }
      ];
    }
    this.files = data;
    this.treeBody = document.querySelector(id);
    onkeydown = function(e) {
      if (e.keyCode == 16) {
        shiftDown = 1;
      } else if (e.keyCode == 17) {
        ctrlDown = 1;
      }
    };
    onkeyup = function(e) {
      if (e.keyCode == 16) {
        shiftDown = 0;
      } else if (e.keyCode == 17) {
        ctrlDown = 0;
      }
    };
    this.treeBody.innerHTML =
      "<div class='search-box'><input class='search-input' id='searchInput'  type='text' placeholder='请输入需要搜索的关键字'></div><div class='ul-box'></div>";
    this.treeBody.ulBox = this.treeBody.querySelector(".ul-box");
    this.treeBody.search = this.treeBody.querySelector(".search-input");
    treeData = this.disposeData(data);
    this.treeBody.search.oninput = this.searchInput;
    //传入数据
    this.init();
  }
  //初始化
  init() {
    //根据sort进行排序，后期可以加开关
    this.diposeSort();
    //每次初始化都是重新加载ul
    this.treeBody.ulBox.innerHTML = "<ul></ul>";
    this.treeBody.ulBox.ul = this.treeBody.querySelector("ul");
    this.treeBody.ulBox.treeNode;
    this.assignmentLi(this.treeBody.ulBox.ul, treeData, 0);
    this.updateNode();
    this.li.forEach(a => {
      a.onclick = this.fold;
      let div = a.querySelector("div");
      div.onmouseover = this.showEdit;
      div.onmouseout = this.hideEdit;
      div.querySelector(".icon-edit").onclick = this.edit; //编辑
      div.querySelector(".icon-add").onclick = this.addSonNode; //下级节点添加
      div.querySelector(".icon-same-level").onclick = this.addNextNode; //同级节点添加
      div.querySelector(".icon-remove").onclick = this.removeNode; //移除
    });
    //拖拽
    this.treeBody.querySelectorAll(".treeNode").forEach(a => {
      a.addEventListener("dragstart", function(event) {
        event.dataTransfer.setData("index", event.target.dataset.index);
        // document.getElementById("demo").innerHTML = "开始拖动 p 元素";
      });
      a.addEventListener("dragover", function(event) {
        event.preventDefault();
        //阻止dragover，否则无法触发drop
      });
      a.addEventListener("drop", function(event) {
        event.preventDefault();
        let index = event.target.dataset.index;
        //定位
        if (typeof index === "undefined") {
          index = event.target.parentNode.dataset.index;
        }
        let moveIndex = event.dataTransfer.getData("index");
        let move = obj.getNodeByIndex(treeData, moveIndex) ? changeNode : null;
        let target = obj.getNodeByIndex(treeData, index) ? changeNode : null;
        let parent = obj.getNodeByIndex(treeData, move.pid) ? changeNode : null;
        //判断，不能将父节点移动到子节点中并且起始位置和目标位置不能相同
        if (move.pid != target.id && !obj.judgeSonNode(move.children, target)) {
          let tmp = [];
          parent.children.forEach(a => {
            if (a.id != move.id) {
              tmp.push(a);
            }
          });
          parent.children = tmp;
          if (parent.children.length == 0) {
            parent.active = false;
            parent.show = false;
          }
          move.pid = target.id;
          target.children.push(move);
          obj.moveExpand(move);
          obj.init();
        }
      });
    });
  }
  judgeSonNode(parentArr, son) {
    let flag = parentArr.some(function(item) {
      if (item.id == son.id) {
        return true;
      } else {
        return obj.judgeSonNode(item.children, son);
      }
    });
    return flag;
  }
  searchInput() {
    let idArr = [];
    obj.searchValue(treeData, this.value, idArr);
    //清空标红
    obj.treeBody.querySelectorAll(".treeNode").forEach(d => {
      obj.removeClass(d, "search");
    });
    idArr.forEach(a => {
      //标红
      obj.addClass(
        document.getElementById(a.id).previousElementSibling,
        "search"
      );
      //打开父节点
      obj.openParentNode(a.pid);
    });
  }
  openParentNode(id) {
    if (obj.getNodeByIndex(treeData, id)) {
      obj.unCombine(
        document
          .getElementById(id)
          .previousElementSibling.querySelector("i:first-child")
      );
      obj.openParentNode(changeNode.pid);
    }
  }
  searchValue(data, value, arr) {
    if (value.length > 0) {
      data.forEach(a => {
        if (a.title.toLowerCase().indexOf(value.toLowerCase()) != -1) {
          arr.push(a);
        }
        if (a.children.length > 0) {
          obj.searchValue(a.children, value, arr);
        }
      });
    }
  }
  diposeSort() {
    this.sortTree(treeData);
    // 根据当前顺序重新赋值sort序号
    this.resetSort(treeData);
  }
  resetSort(arr) {
    let sortIndex = 0;
    arr.forEach(item => {
      item.sort = sortIndex;
      sortIndex += 2;
      if (item.children.length > 0) {
        obj.resetSort(item.children);
      }
    });
  }
  //选中
  active(node) {
    if (ctrlDown == 0) {
      //移除其它节点的选中
      this.treeBody.querySelectorAll(".treeNode").forEach(domNode => {
        obj.removeClass(domNode, "active");
      });
      this.removeActive(treeData);
    }
    obj.addClass(node, "active");
    if (obj.getNodeByIndex(treeData, node.dataset.index)) {
      changeNode.active = true;
    }
  }
  removeActive(data) {
    data.forEach(node => {
      node.active = false;
      if (node.children.length > 0) {
        obj.removeActive(node.children);
      }
    });
  }
  sortTree(data) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data.length - i - 1; j++) {
        if (Number(data[j].sort) > Number(data[j + 1].sort)) {
          let temp = data[j + 1];
          data[j + 1] = data[j];
          data[j] = temp;
        }
      }
    }
    data.forEach(
      function(item) {
        this.sortTree(item.children);
      }.bind(this)
    );
  }
  //折叠/展开
  fold(e) {
    //阻止父节点冒泡
    e.stopPropagation();
    if (obj.getNodeByIndex(treeData, this.querySelector("div").dataset.index)) {
      let icon = this.querySelector("i:first-child");
      if (changeNode.children.length > 0) {
        if (icon.classList.contains("icon-show")) {
          changeNode.show = false;
          obj.combine(icon);
        } else {
          changeNode.show = true;
          obj.unCombine(icon);
        }
      }
    }
    obj.active(this.querySelector(".treeNode"));
  }
  combine(dom) {
    //合并
    obj.removeClass(dom, "icon-show");
    obj.removeClass(dom.nextSibling, "icon-unFile");
    obj.addClass(dom, "icon-hide");
    obj.addClass(dom.nextSibling, "icon-file");
    obj.addClass(dom.parentNode.parentNode.querySelector("ul"), "none");
  }
  unCombine(dom) {
    //展开
    obj.removeClass(dom, "icon-hide");
    obj.removeClass(dom.nextSibling, "icon-file");
    obj.addClass(dom, "icon-show");
    obj.addClass(dom.nextSibling, "icon-unFile");
    obj.removeClass(dom.parentNode.parentNode.querySelector("ul"), "none");
  }
  hideEdit() {
    obj.addClass(this.querySelector(".icon-edit"), "none");
    obj.addClass(this.querySelector(".icon-add"), "none");
    obj.addClass(this.querySelector(".icon-same-level"), "none");
    obj.addClass(this.querySelector(".icon-remove"), "none");
  }
  showEdit() {
    obj.removeClass(this.querySelector(".icon-edit"), "none");
    obj.removeClass(this.querySelector(".icon-add"), "none");
    obj.removeClass(this.querySelector(".icon-same-level"), "none");
    obj.removeClass(this.querySelector(".icon-remove"), "none");
  }
  edit(e) {
    e.stopPropagation();
    let content = this.previousElementSibling;
    let text = content.innerText;
    //宽度跟随
    let inputWidth =
      Number(content.parentNode.style.width.replace("px", "")) - 140;
    content.innerHTML =
      "<input type='text' style='width:" + inputWidth + "px'/>";
    let input = content.children[0];
    input.value = text;
    //选中文字
    input.select();
    let index = this.parentNode.dataset.index;
    //失去焦点时重新赋值
    input.onblur = function() {
      this.parentNode.innerHTML = this.value;
      //修改宽度
      let dwidth = obj.caculateWidth(
        this.value.length,
        Number(content.parentNode.style.paddingLeft.replace("px", ""))
      );
      content.parentNode.style.width = dwidth + "px";
      //修改对应数据
      obj.changeTitle(index, this.value);
      obj.active(content.parentNode);
      //选中
      //对外提供的空白接口，用于添加编辑后的交互代码
      obj.editExpand(changeNode);
    };
    input.onkeyup = function(e) {
      if (e.keyCode === 13) {
        //按下回车键 手动调用表单失去焦点事件
        this.blur();
      }
    };
  }
  removeNode(e) {
    e.stopPropagation();
    let id = this.parentNode.dataset.index;
    if (obj.getNodeByIndex(treeData, id)) {
      delNode = changeNode;
      if (obj.getNodeByIndex(treeData, changeNode.pid)) {
        let tmp = [];
        changeNode.children.forEach(a => {
          if (a.id != id) {
            tmp.push(a);
          }
        });
        changeNode.children = tmp;
      } else {
        let tmp = [];
        if (treeData.length > 1) {
          treeData.forEach(a => {
            if (a.id != id) {
              tmp.push(a);
            }
          });
          treeData = tmp;
        } else {
          console.log("至少保留一个");
        }
      }
      obj.init();
      obj.removeExpand(delNode);
    }
  }
  removeExpand(node) {}
  moveExpand(node) {}
  editExpand(changeNode) {}
  addSonNode(e) {
    e.stopPropagation();
    let p = this.parentNode.style.paddingLeft;
    let pid = this.parentNode.dataset.index;
    let tmpPadding = Number(p.replace("px", "")) + paddingLeft;
    if (obj.getNodeByIndex(treeData, pid)) {
      let newNode = {
        id: obj.generateId(),
        pid: pid,
        title: "title",
        show: false,
        children: [],
        active: true
      };
      obj.removeActive(treeData);
      changeNode.children.push(newNode);
      changeNode.show = true;
      obj.init();
      //触发编辑
      let input = document
        .getElementById(newNode.id)
        .parentNode.querySelector(".icon-edit");
      input.click();
    }
  }
  addNextNode(e) {
    e.stopPropagation();
    let p = this.parentNode.style.paddingLeft;
    let id = this.parentNode.dataset.index;
    let tmpPadding = p.replace("px", "");

    if (!obj.getNodeByIndex(treeData, id)) {
      return;
    }
    let pid = changeNode.pid;
    let tmpSort = changeNode.sort + 1;
    let newNode = {
      id: obj.generateId(),
      pid: pid,
      title: "title",
      show: false,
      children: [],
      sort: tmpSort,
      active: true
    };
    obj.removeActive(treeData);
    if (obj.getNodeByIndex(treeData, pid)) {
      changeNode.children.push(newNode);
      changeNode.show = true;
    } else {
      treeData.push(newNode);
    }
    obj.init();
    //触发编辑
    let input = document
      .getElementById(newNode.id)
      .parentNode.querySelector(".icon-edit");
    input.click();
  }
  getNodeByIndex(operData, index) {
    let flag = operData.some(
      function(item) {
        if (item.id === index) {
          changeNode = item;
          return true;
        } else {
          return this.getNodeByIndex(item.children, index);
        }
      }.bind(this)
    );
    return flag;
  }
  setNodeByIndex(operData, index, data) {
    let flag = operData.some(
      function(item) {
        if (item.id === index) {
          data.node = item;
          return true;
        } else {
          return this.setNodeByIndex(item.children, index, data);
        }
      }.bind(this)
    );
    return flag;
  }
  changeTitle(index, title) {
    if (this.getNodeByIndex(treeData, index)) {
      changeNode.title = title;
    }
  }
  hasClass(elem, cls) {
    cls = cls || "";
    if (cls.replace(/\s/g, "").length == 0) return false; //当cls没有参数时，返回false
    return new RegExp(" " + cls + " ").test(" " + elem.className + " ");
  }
  addClass(ele, cls) {
    if (!obj.hasClass(ele, cls)) {
      ele.className = ele.className == "" ? cls : ele.className + " " + cls;
    }
  }
  removeClass(ele, cls) {
    if (obj.hasClass(ele, cls)) {
      var newClass = " " + ele.className.replace(/[\t\r\n]/g, "") + " ";
      while (newClass.indexOf(" " + cls + " ") >= 0) {
        newClass = newClass.replace(" " + cls + " ", " ");
      }
      ele.className = newClass.replace(/^\s+|\s+$/g, "");
    }
  }
  random4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  generateId() {
    let id = "";
    for (let i = 0; i < 8; i++) {
      id += this.random4();
    }
    return id;
  }
  caculateWidth(length, tmpPadding) {
    let divWidth = this.treeBody.ulBox.offsetWidth - tmpPadding;
    divWidth = divWidth > 170 ? divWidth : 170;
    let fontSize = window.getComputedStyle(this.treeBody.ulBox).fontSize;
    fontSize = Number(fontSize.replace("px", ""));
    let width = length * fontSize + 120;
    divWidth = divWidth < width ? width : divWidth;
    return divWidth;
  }
  generateLi(node, tmpPadding) {
    let divWidth = this.caculateWidth(node.title.length, tmpPadding);
    let treeEmpty = "";
    treeEmpty = node.children.length === 0 ? "treeEmpty" : "";
    let none;
    let status;
    let file;
    if (node.show) {
      status = "icon-show";
      file = "icon-unFile";
      none = "";
    } else {
      status = "icon-hide";
      none = "none";
      file = "icon-file";
    }
    let active = node.active ? "active" : "";
    let li =
      "<li>" +
      '<div class="treeNode ' +
      treeEmpty +
      " " +
      active +
      '" data-index="' +
      node.id +
      '" ' +
      'draggable="true"' +
      ' style="padding-left: ' +
      tmpPadding +
      "px;width:" +
      divWidth +
      'px">' +
      '<i class="icon ' +
      status +
      '"></i>' +
      '<i class="icon ' +
      file +
      '"></i>' +
      " <span class='content'>" +
      node.title +
      "</span>" +
      "<i class='icon-edit none' ></i>" +
      "<i class='icon-add none' ></i>" +
      "<i class='icon-same-level none' ></i>" +
      "<i class='icon-remove none' ></i>" +
      "</div>" +
      '<ul id="' +
      node.id +
      '" class="' +
      none +
      '">' +
      "</ul>" +
      "</li>";
    return li;
  }
  assignmentLi(ul, liData, pl) {
    let tmpPadding = pl + paddingLeft;
    liData.forEach(a => {
      let li = this.generateLi(a, tmpPadding);
      ul.insertAdjacentHTML("beforeend", li);
      this.assignmentLi(document.getElementById(a.id), a.children, tmpPadding);
    });
  }
  //获取所有节点
  updateNode() {
    this.li = this.treeBody.ulBox.querySelectorAll("li");
  }
  bindClick() {}
  //数据处理
  disposeData(files) {
    let root = [];
    files.forEach(a => {
      if (!this.getParentFlag(a.pid)) {
        let d = {
          id: a.id,
          pid: a.pid,
          title: a.title,
          show: false,
          children: [],
          sort: a.sort,
          active: a.active
        };
        root.push(d);
      }
    });
    //根据根节点转换数据
    root.forEach(a => {
      this.getChildren(a);
    });
    return root;
  }
  //递归填充子节点数据
  getChildren(parentNode) {
    let pid = parentNode.id;
    let arr = parentNode.children;
    this.files.forEach(a => {
      let pidArr = a.pid.split(",");
      if (pidArr.indexOf(pid) != -1) {
        let d = {
          id: a.id,
          pid: a.pid,
          title: a.title,
          children: [],
          sort: a.sort
        };
        arr.push(d);
      }
    });
    arr.forEach(a => {
      this.getChildren(a);
    });
  }
  //判断父节点存在
  getParentFlag(pid) {
    let hasParent = false;
    let files = this.files;
    for (let i = 0; i < files.length; i++) {
      let pidArr = pid.split(",");
      if (pidArr.indexOf(files[i].id) != -1) {
        hasParent = true;
        break;
      }
    }
    return hasParent;
  }
  getTreeData() {
    return treeData;
  }
  parseOrign(tree, arr) {
    if (typeof arr === "undefined") {
      arr = [];
    }
    tree.forEach(a => {
      let node = {
        id: a.id,
        pid: a.pid,
        title: a.title,
        sort: a.sort
      };
      arr.push(node);
      this.parseOrign(a.children, arr);
    });
    return arr;
  }
}
