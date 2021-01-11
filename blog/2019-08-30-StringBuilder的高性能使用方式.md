---
slug: StringBuilder-High-Performance-Usecase
title: StringBuilder的高性能使用方式总结
author: CkaiGrac
author_title: 应用软件研发部
author_url: https://github.com/CkaiGrac
author_image_url: https://avatars1.githubusercontent.com/u/44230699?s=460&v=4
tags: [Java]
---

#### 一、设置合理的初始长度

在StringBuilder的源码中，有一个char[ ]数组，这个就是用来存储字符的。

```java
//AbstractStringBuilder.java
/**
* The value is used for character storage.
*/
char[] value;
/**
* The count is the number of characters used.
*/
int count;
```

而count统计字符数量。当直接`new StringBuilder();`时，传递到父类的默认大小(capacity)为16，也就是默认状态下char[ ]数组的长度为16。
来看一下append方法：

<!--truncate-->

```java
//AbstractStringBuilder.java
public AbstractStringBuilder append(String str) {
    if (str == null)
        return appendNull();
    int len = str.length();
    ensureCapacityInternal(count + len);
    str.getChars(0, len, value, count);
    count += len;
    return this;
}

private void ensureCapacityInternal(int minimumCapacity) {
    // overflow-conscious code
    if (minimumCapacity - value.length > 0) {
        value = Arrays.copyOf(value,
                newCapacity(minimumCapacity));
    }
}

public static char[] copyOf(char[] original, int newLength) {
    char[] copy = new char[newLength];
    System.arraycopy(original, 0, copy, 0,
                    Math.min(original.length, newLength));
    return copy;
}

private int newCapacity(int minCapacity) {
    // overflow-conscious code
    int newCapacity = (value.length << 1) + 2;
    if (newCapacity - minCapacity < 0) {
        newCapacity = minCapacity;
    }
    return (newCapacity <= 0 || MAX_ARRAY_SIZE - newCapacity < 0)
        ? hugeCapacity(minCapacity)
        : newCapacity;
}
```

从上述源码中，可以看到append方法接收String类型的参数，然后调用`ensureCapacityInternal()`方法，在这个方法里面我们可以看到做了一个判断，最小容量`minimumCapacity`是否比数组的长度大，而最小容量的大小是`len+count`。
数组长度大于最小容量的话就要扩容，`Arrays.copyOf(value,newCapacity(minimumCapacity));`这段代码执行数组拷贝。
从`Array.copyof(char[] original, int newLength)`可以看到第二个参数是数组新的长度，而这个新的长度来自`newCapacity()`的返回值。
在`newCapacity()`中我们看到`int newCapacity = (value.length << 1) + 2;`，char[ ]数组的长度左移一位再加2，也就是长度x2+2。
从上面的分析中就可以看到数组的扩容是成倍的，如果StringBuilder不设置合适的初始长度就会进行扩容，造成一点内存损失。

#### 二、重用StringBuilder

```java
public class MyClass{
    private static Field stringBuilderValueField;
    private static Boolean needGetField = true;
    //ThreadLocal适用于变量在线程之间隔离，方法之间共享
    private static ThreadLocal<StringBuilder> sbBuffer = new ThreadLocal<StringBuilder>();

    //重用StringBuilder的例子
    public static StringBuilder obtainStringBuilder(){
        StringBuilder stringBuilder = sbBuffer.get();
        if (stringBuilder == null) {
            System.out.println("stringBuilder为空");
            stringBuilder = new StringBuilder(1024 * 10);
            sbBuffer.set(stringBuilder);
        } else {
            System.out.println("stringBuilder不为空");
            stringBuilder.delete(0, stringBuilder.length());
        }
        return stringBuilder;
    }
}

//调用方式为
StringBuilder stringBuilder = MyClass.obtainStringBuilder();
StringBuilder stringBuilder2 = MyClass.obtainStringBuilder();
stringBuilder.append(.....);
stringBuilder2.append(.....);
```

从上述的代码中可以看到，`obtainStringBuilder()`方法返回一个StringBuilder对象，方法中首先从ThreadLocal中取StringBuilder然后判断是否为空，如果为空的话则初始化一个StringBuilder对象，大小根据实际情况设置。否则的话就清空StringBuilder的内容来重用。
对于同一个线程来说，每次调用`obtainStringBuilded()`方法拿到的都是同一个StringBuilder对象。但是对于不同线程来说，两个线程之间的StringBuilder对象是相互独立的，没有任何关系。
这样的好处是减少申请内存的频率，降低GC（垃圾回收）的发生。



