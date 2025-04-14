import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { AnonymousPost } from "./AnonymousPost";

@Entity()
export class AnonymousComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  content!: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column()
  anonymousNickname!: string;

  @Column()
  password!: string; // 댓글 수정/삭제를 위한 비밀번호

  @Column()
  ipAddress!: string;

  @ManyToOne(() => AnonymousPost, (post) => post.comments, { onDelete: "CASCADE" })
  post!: AnonymousPost;

  @ManyToOne(() => AnonymousComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parent_id" })
  parent!: AnonymousComment | null;

  @OneToMany(() => AnonymousComment, (comment) => comment.parent)
  replies!: AnonymousComment[];
} 