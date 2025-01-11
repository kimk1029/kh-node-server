// src/entities/User.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { Comment } from "./Comment";
import { Like } from "./Like";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[];

  @UpdateDateColumn()
  updated_at!: Date;
  @OneToMany(() => Like, (like) => like.user)
  likes!: Like[];
}
export default User;
