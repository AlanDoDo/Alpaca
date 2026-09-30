export type ResourceKind = "网站" | "开源项目" | "数据集";

export type Resource = {
  name: string;
  category: string;
  kind: ResourceKind;
  description: string;
  url: string;
  language?: string;
};

export const resourceCategories = ["机器人开发", "仿真与控制", "具身智能", "AI 工具", "研究资料"] as const;

export const resources: Resource[] = [
  { name: "ROS 2 Documentation", category: "机器人开发", kind: "网站", description: "ROS 2 官方文档入口，涵盖概念、教程、工具链与发行版说明。", url: "https://docs.ros.org/en/rolling/", language: "文档" },
  { name: "MoveIt 2", category: "机器人开发", kind: "开源项目", description: "面向机械臂的运动规划、操控与操作应用框架。", url: "https://moveit.picknik.ai/main/index.html", language: "C++ / ROS 2" },
  { name: "Gazebo Sim", category: "机器人开发", kind: "开源项目", description: "机器人仿真工具与文档，可用于构建和运行机器人模拟环境。", url: "https://gazebosim.org/docs/latest/", language: "仿真" },
  { name: "MuJoCo", category: "仿真与控制", kind: "开源项目", description: "面向机器人、生物力学与控制研究的物理仿真引擎。", url: "https://mujoco.readthedocs.io/en/stable/", language: "Python / C" },
  { name: "Isaac Lab", category: "仿真与控制", kind: "开源项目", description: "基于 NVIDIA Isaac Sim 的机器人学习与仿真框架。", url: "https://isaac-sim.github.io/IsaacLab/main/", language: "仿真 / 强化学习" },
  { name: "Gymnasium Robotics", category: "仿真与控制", kind: "开源项目", description: "用于机器人强化学习研究的一组标准化环境。", url: "https://robotics.farama.org/", language: "强化学习" },
  { name: "LeRobot", category: "具身智能", kind: "开源项目", description: "围绕真实机器人学习，提供模型、数据集与训练、控制工具。", url: "https://github.com/huggingface/lerobot", language: "Python / PyTorch" },
  { name: "robomimic", category: "具身智能", kind: "开源项目", description: "机器人模仿学习研究框架，包含算法、基准任务与数据工具。", url: "https://robomimic.github.io/", language: "模仿学习" },
  { name: "PyTorch", category: "AI 工具", kind: "网站", description: "深度学习框架官方文档，包含张量、模型构建与训练指南。", url: "https://pytorch.org/docs/stable/", language: "文档" },
  { name: "Hugging Face Hub", category: "AI 工具", kind: "网站", description: "发现和共享机器学习模型、数据集及演示应用的平台。", url: "https://huggingface.co/docs/hub", language: "模型 / 数据" },
  { name: "Open X-Embodiment", category: "研究资料", kind: "数据集", description: "跨机器人形态的真实世界机器人数据集与协作研究项目。", url: "https://github.com/google-deepmind/open_x_embodiment", language: "机器人数据" },
  { name: "arXiv · Robotics", category: "研究资料", kind: "网站", description: "浏览机器人学相关预印本论文，跟踪近期研究方向。", url: "https://arxiv.org/list/cs.RO/recent", language: "论文" },
];
