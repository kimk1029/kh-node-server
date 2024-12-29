// src/entities/Post.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  content!: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  author!: User;

  @Column({ type: "int", default: 0 })
  views!: number; // 조회수 필드 추가
}
