import java.io.*;
import java.util.regex.*;

public class DataParser{
	public static void main(String[] args){		
		try {
			File file = new File("data/FPLAN");
			BufferedReader br = new BufferedReader(new FileReader(file));
			File fout = new File("data/FPlan_filtered.csv");
			FileOutputStream fos = new FileOutputStream(fout);		 
			BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(fos));
			String line;
			char[] tmp = new char[14];
			System.out.println("Processing data...");
			while ((line = br.readLine()) != null) {
				if(Pattern.compile("^(\\d{7}\\s)").matcher(line).find()){
					line.getChars(0,7,tmp,0);
					tmp[7] = ',';
					line.getChars(37,43,tmp,8);
					if(tmp[8]==' '){
						continue;
					}
					bw.write(tmp);
					bw.newLine();
				}		
			}		
			System.out.println("Finished!");
			br.close();
			bw.close();
		} catch (Exception e){
		
		}
	}
}
