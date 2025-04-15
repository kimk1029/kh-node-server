import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { AnonymousComment } from "./AnonymousComment";
import { AnonymousLike } from "./AnonymousLike";

@Entity()
export class AnonymousPost {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  content!: string;

  @Column()
  ipAddress!: string;

  @Column({ default: 0 })
  views!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => AnonymousComment, (comment) => comment.post, {
    cascade: true,
  })
  comments!: AnonymousComment[];

  @OneToMany(() => AnonymousLike, (like) => like.post, {
    cascade: true,
  })
  likes!: AnonymousLike[];
} 