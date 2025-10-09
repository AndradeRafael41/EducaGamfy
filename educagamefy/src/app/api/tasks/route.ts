import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/services/prisma";
import {  SupabaseService } from "@/services/supabase";

const bucket = process.env.BUCKET_NAME!;


const supabaseService = new SupabaseService (bucket);

export async function POST (req: NextRequest){

    try{
        
        console.log("entrou no post");
        console.log("headers:", req.headers.get("content-type"));

        console.log(req);

        const formData = await req.formData();

        console.log(formData);

        var taskId  = formData.get("taskId") as string | null;  // se existir um taskId == é um upload na task;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const maxPoints = parseInt(formData.get("maxPoints") as string);
        const teacherId = parseInt(formData.get("teacherId") as string);
        const file =  formData.get("file") as File | null;
        const classId = formData.get("classId") as string;
        let fileUrl:string | null = null;

        if(!taskId){

            var newTask = await prisma.tasks.create({
                data: {
                    teacher_id: teacherId,
                    title: title,
                    description: description,
                    max_points: maxPoints, 
                    class_id:parseInt(classId)
                } 
            });
            
            taskId = newTask.id.toString();
        }
    

        if (file){

            const timestamp = Date.now();
            const fileName = `${timestamp}-${file.name}`;
            const filePath = `tasks/${taskId}/${fileName}`;

            await supabaseService.uploadFile(filePath,file);
             

            fileUrl = await supabaseService.getPublicUrl(filePath);
            
            console.log("fez o upload");
        }


        const task = await prisma.tasks.update({
            where: { id: parseInt(taskId) }, 
            data: {
                title: title,
                description: description,
                max_points: maxPoints,
                link: fileUrl
            },
        });


        console.log(task);

        return NextResponse.json({success: true, task})
    
    }
    catch (err: any) {
        console.error(err);
        return NextResponse.json({ success: false, error: err.message.toString() }, { status: 500 })

    }
}



