using SocketIOClient;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web.UI.WebControls;
using System.Windows.Forms;

namespace frontend_app
{
    public partial class Form1 : Form
    {
        public delegate void UpdateLabelMethod(string text, bool error);
        public delegate void UpdateMessagesMethod(string text);
        public static bool isRunning = false;

        string serverAddress = "http://localhost:5001/";

        Random rnd = new Random();

        SocketIO client = null;

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            userNameTextBox.Text = $"user_{rnd.Next(1111, 9999)}";
        }

        private void button1_Click(object sender, EventArgs e)
        {
            Debug.WriteLine("clicked");

            if (serverIPTextBox.Text != "")
            {
                serverAddress = serverIPTextBox.Text;
            }

            socketIoManager();

            button1.Enabled = false;
            sendMessageBtn.Enabled = true;
        }

        private async void socketIoManager()
        {
            AddMessage($"socketIoManager called, isrunning: {isRunning}");

            if (isRunning) return;

            isRunning = true;

            try
            {
                client = new SocketIO(serverAddress);
                Debug.WriteLine("past socket initalization");

                client.OnConnected += async (sender, e) =>
                {
                    Debug.WriteLine("ühendatud");
                };

                client.OnDisconnected += async (sender, e) =>
                {
                    UpdateStatus("Disconnected", true);
                };

                client.On("hello", (data) =>
                {
                    Debug.WriteLine(data.GetValue<string>());
                    UpdateStatus(data.GetValue<string>());
                });

                client.On("message", (data) =>
                {
                    AddMessage(data.GetValue<string>());
                });

                await client.ConnectAsync();
            }
            catch
            {
                isRunning = false;
                UpdateStatus("Unable to connect, will keep retrying...", true);
                await Task.Delay(3000);
                socketIoManager();
            }
        }

        private void UpdateStatus(string text, bool error = false)
        {
            if (this.label1.InvokeRequired)
            {
                UpdateLabelMethod del = new UpdateLabelMethod(UpdateStatus);
                this.Invoke(del, new object[] { text, error });
            }
            else
            {
                this.label1.Text = text;

                if (error)
                {
                    label1.ForeColor = Color.Red;
                } else
                {
                    label1.ForeColor = Color.Green;
                }
            }
        }

        private void AddMessage(string text)
        {
            if (this.listBox1.InvokeRequired)
            {
                UpdateMessagesMethod del = new UpdateMessagesMethod(AddMessage);
                this.Invoke(del, new object[] { text });
            } else
            {
                this.listBox1.Items.Add(text);
                this.listBox1.SelectedIndex = this.listBox1.Items.Count - 1;
            }
        }

        private void sendMessageBtn_Click(object sender, EventArgs e)
        {
            SendMessage();
        }

        private void OnKeyDownHandler(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
            {
                SendMessage();
            }

        }

        public class MessageDTO
        {
            public string name { get; set; }
            public string message { get; set; }
        }

        private void SendMessage()
        {
            if (client == null || userMsgTextBox.Text.Length <= 0) return;

            client.EmitAsync("message", new MessageDTO { name = userNameTextBox.Text, message = userMsgTextBox.Text });
            userMsgTextBox.Text = "";
        }

        private void listBox1_DrawItem(object sender, DrawItemEventArgs e)
        {
            e.DrawBackground();
            e.DrawFocusRectangle();
            e.Graphics.DrawString(listBox1.Items[e.Index].ToString(), e.Font, new SolidBrush(e.ForeColor), e.Bounds);
        }

        private void listBox1_MeasureItem(object sender, MeasureItemEventArgs e)
        {
            e.ItemHeight = (int)e.Graphics.MeasureString(listBox1.Items[e.Index].ToString(), listBox1.Font, listBox1.Width).Height;
        }

        private int GetLinesNumber(string text)
        {
            int count = 1;
            int pos = 0;
            while ((pos = text.IndexOf("\r\n", pos)) != -1) { count++; pos += 2; }
            return count;
        }
    }
}
