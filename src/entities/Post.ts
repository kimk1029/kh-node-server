// src/entities/Post.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comments";
export enum PostTag {
  NEWS = "news",
  TUTORIAL = "tutorial",
  OPINION = "opinion",
  // 필요한 태그를 추가하세요
}
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

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments!: Comment[];
  @Column({
    type: "enum",
    enum: PostTag,
    default: PostTag.NEWS,
  })
  tag!: PostTag;
}
