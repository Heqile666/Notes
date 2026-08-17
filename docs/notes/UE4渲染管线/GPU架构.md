# 1 GPU 的硬件结构

## 1.1 GPU 的基本结构组成

**Processing Core**：目前不区分做 VS 的 Shading Core 还是做 PS 的 Shading Core，现代 GPU 架构中只有 Unified Shading Core，即统一的 Shading Core 既可以给 VS 做计算也可以为 PS 做计算。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image.png)

**Core Warp**：由一组 Processing Core 组成，一般称为 Warp，Warp 与 Warp 还能组成一个高维的 Warp Group，同一个 Warp 中的 Processing Core 是高度统一执行步骤的，即指令流一样。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-1.png)

**Fixed Pipeline**：一个 Warp 会有几个固定的渲染 Pipeline。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-2.png)

**Memory Cache**：每个 Warp 中会有多级 Cache，用于数据缓存。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-3.png)

## 1.2 Shading Core/Processing Core 的组织

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-4.png)

Shading Core 是进行算数运算的核心单元，现代 GPU 一般是通用架构的 USM ARCH，Core 是由单独的或者共享的算数指令单元组成：

- **FMA**（FloatPoint Mult-Add）：浮点数乘加，最基本的算数指令
- **SFU**：特殊指令，Special Function Unit，执行 sin、cos 等复杂指令

USM Core 被组织成更高维度的组：

- 通常第一维的组叫做 warp（或 wavefront）
- Warp 内共享一套指令流/管线/状态机
- 高级的 GPU 还有：RT Core 和 Tensor Core

## 1.3 管线和内存访问

GPU 中固化设计好的光栅化图形处理管线，可以每个 Warp 对应一套，也可以多个 Warp 共享几套。

内存访问行为：

- **贴图采样**：使用采样器进行贴图读取，通过 Texture Processing Unit（TPU），每个 warp 对应几个，或多个 warp 共享几个
- **Load/Store**（非采样行为的内存读写，包括贴图的写入和 fetch）：通过 Load/Store Unit，每个 warp 对应几个，或多个 warp 共享几个

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-5.png)

## 1.4 GPU 内存访问层级

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-6.png)

GPU 访问到的内存从离芯片的距离（性能从高到底）分为：

- **L0 Cache**
  - 缓存指令，每个 Warp 一个，很小
  - 移动端 GPU 可能没有 L0，而是合并在 L1 中
- **L1 Cache**
  - 缓存访问数据，load/store 和 TPC 都会先访问 L1，用 L2 作为 back up
  - 可能多个 warp 共享一个，几十-上百 K
- **L2 Cache**
  - 所有 Core 共享的内存 cache，用主存做 back up
  - 移动端在几百 K 规模，PC 端在几十 M 规模
  - 移动端为了减少对主存访问，用 L2 cache 做一个 tile 的渲染，也称 tile buffer

# 2 PC 端 GPU 架构

## 2.1 整体预览

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-7.png)

绿色块里面最小的一个矩形就是一个 Processing Core。

- Processing Core 组织成 4 维：Cuda Core -> Warp -> Streaming MultiProcessor -> Graphic Processing Cluster
- Graphics Processing Clusters（GPC）：12 组
- Streaming MultiProcessors（SM）：每组 GPC 有 12 个
- Warp：每个 SM 有 4 个 Warp
- Cuda Core/Processor Core：每个 Warp 32 个
- L2 cache：96M

## 2.2 GPC 架构

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-8.png)

- 12 个 SM
- 1 个 Raster Engine
- 每个 RasterEngine 分别对应 1 块 Raster Operation Partition（ROP），每块 ROP 上面有 8 个 ROP Unit，ROP Unit 负责把像素/片元经过深度测试、模板测试、混合等操作后，最终写入 Render Target / Depth Buffer（AI 补充）
- Texture Processing Cluster（TPC）：6 个贴图采样器

## 2.3 SM 架构和 Warp 架构

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-9.png)

- 4 个 warp
- 共享 4 个 Texture Unit
- 1 个 RayTracingCore：BVH 遍历和 ray-triangle 相交计算
- 共享 L1 cache：128K
- 32 个 Cuda Core：其中 16 个用于处理 fp32 的 FMA，16 个用于处理 fp32 或 int32 的 FMA
- 1 个 SFU：特殊指令以及 varying 插值
- 4 个 Load/Store Unit
- 1 个 tensor core：machine learning 计算
- L0 cache：指令 cache
- warp scheduler & dispatch unit

# 3 移动端 GPU 架构

与 PC 端相比，移动端的 Processing Core 就很少了。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-10.png)

这里的 Shader Core 就是 Warp，(Processing Unit) Process Core -> Shader Core（Warp）。

- L2 Cache：也叫 Tile Buffer（64-128K）
- Tile-Based Rendering（移动端特有的 Tiling 结构和特殊的管线流程）

## 3.1 移动端 Warp 架构

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-11.png)

一个 warp 里面有一套固定管线（光栅化，Varying Unit，early test，late test，blend 和 tile write）。

- 两个 Core，叫做 Processing Engine（PE），可以同时处理两个 Fragment
- L1 cache：大小一般为 16K，cache line 一般是 64 byte
- Load/Store Unit：一个
- Texture Unit：一个，一个 cycle 可采样 4 个 bilinear（trilinear 减半，2x aniso 减半，超过 32bit 的 format 减半）

由此可见，移动端 GPU 的采样器非常的稀少，一个 Warp 只有一个采样器，全局也就只用 6 个采样器，采样操作也昂贵许多，所以需要简化贴图格式，减少采样操作。

虽然物理上一个 warp 只有 2 个 core，但多个任务可以组成一组。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-12.png)

如 16 个任务被一个 warp 处理（相当于一个 warp 的大小是 16），简单来说就是一个 Warp 将这个任务循环了 8 次，这样可以提高硬件利用率。

一个 Core（或 PE）内包含 3 种算数处理单元：

- **FMA**：复杂数学计算（16 bit wide）
- **CVT**：简单数学计算（16 bit wide），一些指令可以不要那么严格的计算，可以走 faster Math，运算效率会提高，但是会有副作用，如不会报 NAN、运算的数据为 0 等，不会根据 IEEE 的规则生成浮点数做一些校验
- **SFU**：特殊指令（4x4 bit wide）

## 3.2 移动端 GPU 任务处理流程

任务处理的基本单元包括：单个 RenderPass 内的所有 Fragment Process（就是说有的 pixel shader 部分），以及 Non-Fragment Process（vs/gs/tessellation，对顶点的处理即非像素的处理）。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-13.png)

现代 API 都有多线程提交渲染命令的功能，如上图所示一个线程提交的是 RenderPassA 的渲染命令，另一个提交的是 RenderpassB 的渲染命令，这些渲染命令会被驱动分拣成两部分，一部分是像素部分的处理，另一部分就是顶点部分的处理，不同 Pass 的像素部分处理和顶点部分的处理是可以并行的，但是同一个 RenderPass 的会保证 nonfrag-tiling-frag 处理的顺序，处理同一个 Work 时会尽量利用满所有的 shader core。

> 注：在 PC 上其实 RenderPass 这个概念其实没有一个清晰的存在，但是在移动端是有明确的 RenderPass 的概念的，一个 RenderPass 的所有 drawcall 是属于一个基本单元的，跨 RenderPass 就不属于一个工作单元了，不同的 RenderPass 也会有内存以及指令上的同步。

## 3.3 移动端特有的管线流程 - 降低功耗

移动降低功耗的设计理念就是减少移动端 GPU 访问内存次数。

### 1. Dual-Pass Geometry Process

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-14.png)

移动端 GPU 会做两遍 VS，尽量减少不可见的 vertex 的计算，第一段先使用 position only 的 shader 计算 position，做 clipping 和 culling，第二遍再进行完整的 vs 计算。

> 注：position only 是指在原来的 vs 计算中只涉及 position 的计算，不涉及其他属性的计算，如 uv、顶点色的输出等。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-15.png)

Tile buffer Rendering 可以减少内存访问的带宽，片上内存（L2 Cache）可以放下一个 tile 的渲染数据（rt、stencil buffer、depth buffer），不必再访问内存，减少内存访问的带宽。

# 4 GPU 的工作模式

## 4.1 管线

GPU 需要遵循固化的流程并为它提供数据，GPU 的工作流程是被精心设计过的，固定流程部分：设置参数和开关（如开启关闭深度测试）。设置可编程部分的程序：即 shader。为管线填充数据：在显存上创建对象，并绑定到固定的绑定点。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-16.png)

## 4.2 API

API 是基于 GPU 的工作规则对 GPU 下达的命令，它由 Driver 转述成 GPU 可以执行的指令。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-17.png)

现在图形 API 开放了很多底层操作，现代开发者需要做内存管理、GPU 与 CPU 同步管理等。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-18.png)

## 4.3 移动端硬件的特殊优化

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-19.png)

TBR 首先对所有 DrawCall 走 vs/gs 流程，之后会收集所有的顶点数据，做 BinningPass，将所有顶点数据分到不同的 Tile 上，然后对每个 Tile 光栅化再进行渲染。

> 注：既然知道哪些顶点会被分到哪些 tile 上，那就知道哪一个像素离屏幕最近（这种判断一般在光栅化后，PS 前），只绘制这个最近的像素即可，这就是 TBDR 的原理。

手机设计的第一原则 - 功耗，访问 On-chip buffer 可以认为是免费的。

- 访问 DRAM（全屏 RT）会产生搬运数据的代价 - 功耗发热
- 一个 pass 的 Frag Process 依赖所有 GeometryProcess 结束
- 从 TBR 到 TBDR，硬件可以判断哪些 pixel 因为被遮挡而不需要被 Shading 出来，也叫做 Hidden Surface Removal / Low resolution z

对于移动端 GPU：

- 一帧结束前一定要 Clear（防止对应 tile 上的数据从主存上加载，以及 tile 中的数据写入到主存）
- 尽可能 Discard 不使用的 Framebuffer
- 减少 FrameBuffer 的切换，合并 pass
- AlphaTest/Discard 效率差（尤其避免穿插于 Opaque 对象之间）
- 充分考虑到可能自带 early-z
- Blending/MSAA 效率比较高（所需要的数据在 tile 上，不需要从主存中加载）

# 5 从硬件角度看渲染瓶颈

如图所示，红圈区域都是渲染过程中的瓶颈。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-20.png)

## 5.1 API

渲染的瓶颈一般最先出现在 CPU 侧，告诉 GPU 怎样去渲染，可能比 GPU 实际去做渲染要慢的多！在图形 api 一侧，需要设置渲染状态，绑定资源，提交绘制指令，这些都是 api 侧的性能瓶颈。

比如管线上最多只能挂载 16 张贴图，但是一个游戏中贴图是成千上万的，所以就需要不断地切换贴图，重新挂载。

此外，对于不同的 drawcall，需要不断地切换渲染状态（是否开启深度测试，是否开启 blend），这些都是非常耗时的。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-21.png)

所以总结起来，影响性能的地方一共有四个方面：

1. 资源的准备
2. 渲染状态切换
3. 绘制指令提交次数
4. 同时绑定的资源槽数量限制

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-22.png)

目前常用的措施有：

- **Culling**（减少资源的提交数量和 dc 的数量）
  - Frustum Culling
  - Occlusion Culling
  - Rasterization Culling
- **Batching**（减少资源的绑定次数和 dc 的数量）
  - Mesh Combine
  - GPU Instancing
  - Dynamic/Static Batching
- **Multithread API**（多线程提交 API）
  - Call/Record/Submit
  - Low-level API
- **GPU PipeLine**
  - GPU Scene
  - Indirect Drawcall Generation
  - Usually with GPU Instancing

## 5.2 Shader Processor

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-23.png)

如图是 Apple A9 GPU 在一个 cycle 内可以做的操作：

- 可以进行两次乘加运算/两次加法运算/两次乘法运算
- 一次贴图采样/插值等等

所以对应优化就是：

- 尽量使用 half 而不是 Float，少使用 int（int 运算器很少）
- 尽量使用 MAD 操作，因为 MAD 操作和 ADD/MUL 操作所使用的时间相等

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-24.png)

此外应该避免分支代码。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-25.png)

如图所示，图中一共有 32 个像素，当进入到分支运算的时候一部分像素进入到 if 分支计算，那么另一部分像素没有进入到 if 分支就需要等待，这样就会造成一个像素的计算结果时间变长。

注意如果对于分支运算，所有分支都走到 if 分支或者 else 分支，那么这种情况下除了 shader 代码变长之外，没有其他影响，可以大胆写 if 代码。

此外上面的 32 个计算可以理解为一个 size 为 32 的 warp 的计算过程，一个 warp 的片元算完后，就推进到 ROP 阶段做深度测试/混合，然后写 framebuffer。

流水线持续前进，不需要等其他 warp 算完——第一批写完时，后面的可能还在算，所以如果一个 warp 的 size 为 1，那么也就不会受 if else 的影响了。

此外要避免循环中套循环以及循环中搭配 branch 等复杂代码，会让 shader 的预测计算失败。

在 shader 中还有 OverDraw（对于同一个 Shader 反复执行多次 shading）的危害，OverDraw 的来源有：

- 半透明
- 后处理
- 没有良好的顺序绘制场景

对于不带有 HSR/LRZ 的设备（PC，极低端手机）：

- 可以通过由近及远的顺序绘制，同时开启 early-z
- 可以预先绘制一遍场景的深度，就不用保证顺序，即 pre-z/early-z pass（prepass 会增加 drawcall 即 CPU 的负担）

对于基于 TBDR 的带 HSR 的移动端设备，硬件可以自行优化，但是要注意规则：

- TBDR 对半透没有作用
- 对于 alphatest 的不透明物体，没有作用，因为 TBDR 的作用是在光栅化后、PS 前，但是 Alpha Test 是在 PS 中计算的
- 所以要避免将 alpha-test 插入到不透明绘制之间

可以按照下面的方式来设计渲染流程：

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-26.png)

此外也可以专门做一个 AlphaTest Pass，先绘制 AlphaTest 物体的深度值，之后在正常做不透明物体的绘制，然后再绘制 AlphaTest 物体，通过对 AlphaTest 物体的深度值是否和当前深度缓冲中的值相等来判断是否对该片元进行 shading。

注意 AlphaTest pre-z 也会很耗时，因为要在 shader 中采样 AlphaTest 贴图去做 discard 操作，是否真的能提升性能需要做测试。

在 GPU 上也有一些同步引起的效率问题，low-level 的 api 可以提供更加细粒度的同步机制。

比如两个 DrawCall，A 和 B，B 需要 A 的像素输出数据，对于非 Low-level 的 api 来说只能等待 A 的 PS 完成之后，才能进行 drawCall B 的绘制。

对于 Low-level 的 api 来说，A 和 B 的 vs 阶段可以并行执行，但是 ps 阶段只能等待 A 的 ps 完成之后，才能进行 drawCall B 的绘制。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-27.png)

## 5.3 BandWidth

带宽是功耗的主要来源。

- **直接导致**
  - Cache Miss
  - GPU STALL
- **间接导致**
  - 发热
  - 处理器降频
- **优化目标**
  - 贴图采样
  - RT 切换和写入
  - Buffer 读写

对于贴图和 buffer 来说：

- **存储精度**：尺寸和压缩格式
  - 几乎没有必要不压缩贴图
  - 硬件支持的格式
  - 16bit/10bit 的顶点属性
- **细节程度**：LOD/mipmap
  - 增内存省带宽
  - 无限提升分辨率没有意义
- **合并**
  - 合并数量，合并通道
  - 节省数量也很重要（散图很多的话，对于 opengles 会给每个贴图维护一个数据结构）
- **裁剪**
  - 去掉没被使用的顶点属性
  - 移动端 position 和其他属性的数据分开存储（dual-pass 第一个 pass 只计算 position）

对于 RT 来说：

- **控制尺寸和精度**
  - RGBA8 / R10G10B10A2 / RGBA16F / RGBA32F / Depth16 / Depth24S8 / Depth32
- **移动端控制 load/store action**（如后续 pass 不需要用到深度贴图，可以直接 discard 掉，不需要从 tile 上写到主存中）
  - glInvalidateFramebuffer / glDiscardFramebuffer
  - Metal/Vulkan discard

## 5.4 Memory

- Shader 变体
- Driver 内存

High-level API 完全黑盒，且 overhead 较大。

**分析手段：**

- High-Level API 如 GLES：可通过 hook C++ 内存分配/释放的方法来找到那些 API 调用引起内存分配
- Low-Level API 如 Vulkan：大多数 API 中都提供了一个内存分配回调函数给我们通知

**可能原因：**

- Driver 在内存一侧保存结构维护对应的显存资源
- 一些 api 的调用（mapbuffer 等）会引起在 driver 隐式的内存开销

**一些优化方式：**

- 减少 GPU 资源数量！任何 GPU 资源都有在 driver 中的结构化内存，例如某些设备商一个 buffer 就至少有 4K 保底开销。考虑将小的 ubo 合并成大的 ubo
- 不要长期 map 一块 buffer 不放

贴图问题：ASTC 压缩算法对齐问题。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-28.png)

# 6 性能工具

这里不再赘述。

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-29.png)

![](https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main/img/gpu-architecture/image-30.png)
