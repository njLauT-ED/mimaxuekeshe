package ����ѧ;

import java.sql.*;
public class Login {
    public static void main(String[] args)
    {
    	
 	   if(args.length!=2)
 		   System.out.println("�����ʵ���Ŀ�Ĳ���");
 	   String  username;
 	   String userpwd;
 	   String publickey = null;
 	   String privatekey = null;
 	   username=args[0];
 	   userpwd=args[1]; 
 	   int mark=0; 
 	   try {
	        Class.forName("com.mysql.jdbc.Driver");     //����MYSQL JDBC��������   
	        //Class.forName("org.gjt.mm.mysql.Driver");
	       System.out.println("Success loading Mysql Driver!");
	      }
	      catch (Exception e) {
	        System.out.print("Error loading Mysql Driver!");
	        e.printStackTrace();
	      }
	      try {
	        Connection connect = DriverManager.getConnection(
	            "jdbc:mysql://localhost:3306/���ݿ���","  "," ");
	             //����URLΪ   jdbc:mysql//��������ַ/���ݿ���  �������2�������ֱ��ǵ�½�û���������

	        System.out.println("Success connect Mysql server!");
	        //����Statement����
	        Statement stmt = connect.createStatement();
	        //����PreparedStatement����
	        String sql="select * from ���� wherw userName=? ";
	        PreparedStatement pStatement=connect.prepareStatement(sql);
	        pStatement.setString(1, username);
	        ResultSet rs = stmt.executeQuery(sql);  //user Ϊ�������
	        mark=0;   //��ǲ�ѯ���
	       if(rs.next())
	       {
	    	 String tmppwd;
	    	 tmppwd=rs.getString(2);
	    	
	    	 System.out.println("�û���Ϊ�� "+username);
	    	 if(tmppwd==userpwd)
	    	 {
	    	     mark=1;
	    	     publickey=rs.getString(3);
	    	     privatekey=rs.getString(4);
	    	 }
	    	 else {
	    		 System.out.println("�û����벻��ȷ");
	    	 }
	       }
	      }catch (Exception e) {
			// TODO: handle exception
	    	  e.printStackTrace();
		}
	      
	  //����Ҫ�����json���� �û������Ƿ�ƥ�䣬��Կ��˽Կ
	      
	      System.out.print("{"+"\"�û���\""+":"+"\""+username+"\"");
	      System.out.print(","+"\"ƥ��\""+":"+"\""+mark+"\"");
	      System.out.print(","+"\"��Կ\""+":"+"\""+publickey+"\"");
	      System.out.print(","+"\"˽Կ\""+":"+"\""+privatekey+"\""+"}");
    }
}
